<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\SavingGoal;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    use ApiResponse;

    /** Periode bawaan pada filter riwayat (PRD §13). */
    private const PERIODS = ['today', 'week', 'month', 'last_month'];

    /** Jumlah transaksi per halaman bila tidak diminta lain (PRD §33). */
    private const DEFAULT_PER_PAGE = 20;

    /**
     * Daftar transaksi milik pengguna dengan filter dan pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'type' => ['sometimes', 'string', Rule::in(Transaction::TYPES)],
            'category' => ['sometimes', 'string', 'max:50'],
            'period' => ['sometimes', 'string', Rule::in(self::PERIODS)],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ], [
            'type.in' => 'Jenis transaksi tidak valid.',
            'category.max' => 'Kategori maksimal 50 karakter.',
            'period.in' => 'Periode tidak valid.',
            'from.date' => 'Format tanggal mulai tidak valid.',
            'to.date' => 'Format tanggal selesai tidak valid.',
            'page.integer' => 'Halaman harus berupa angka.',
            'page.min' => 'Halaman minimal 1.',
            'per_page.integer' => 'Banyaknya data harus berupa angka.',
            'per_page.min' => 'Banyaknya data minimal 1.',
            'per_page.max' => 'Banyaknya data maksimal 100.',
        ]);

        [$from, $to] = $this->resolveDateRange($filters);

        $query = $request->user()->transactions()->with('savingGoal:id,name');

        if (isset($filters['type'])) {
            $query->ofType($filters['type']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $transactions = $query->betweenDates($from, $to)
            ->latest('transaction_date')
            ->latest('id')
            ->paginate((int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE));

        return $this->successResponse([
            'items' => TransactionResource::collection($transactions->items()),
            'current_page' => $transactions->currentPage(),
            'per_page' => $transactions->perPage(),
            'total' => $transactions->total(),
            'last_page' => $transactions->lastPage(),
        ]);
    }

    /**
     * Simpan transaksi baru (PRD §6, §7).
     *
     * Setoran tabungan (type=saving) HARUS dibuat melalui endpoint deposit
     * target tabungan agar saldo, target, dan status otomatis tersinkron.
     */
    public function store(TransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($validated['type'] === Transaction::TYPE_SAVING) {
            return $this->errorResponse(
                'Setoran tabungan harus dibuat melalui target tabungan.',
                [],
                422
            );
        }

        $transaction = $request->user()->transactions()->create($validated);

        return $this->successResponse(
            new TransactionResource($transaction),
            'Transaksi berhasil disimpan',
            201
        );
    }

    /**
     * Detail satu transaksi.
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $this->ensureOwned($request, $transaction);

        return $this->successResponse(new TransactionResource($transaction));
    }

    /**
     * Ubah transaksi yang sudah ada.
     */
    public function update(TransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $this->ensureOwned($request, $transaction);

        $validated = $request->validated();

        // Setoran tabungan tidak boleh diubah jenisnya ke income/expense,
        // dan income/expense tidak boleh diubah ke saving.
        if ($transaction->type === Transaction::TYPE_SAVING) {
            if ($validated['type'] !== Transaction::TYPE_SAVING) {
                return $this->errorResponse(
                    'Jenis setoran tabungan tidak dapat diubah. Hapus setoran bila tidak diperlukan.',
                    [],
                    422
                );
            }
        } elseif ($validated['type'] === Transaction::TYPE_SAVING) {
            return $this->errorResponse(
                'Setoran tabungan harus dibuat melalui target tabungan.',
                [],
                422
            );
        }

        // Untuk transaksi saving, perlu sinkronisasi saved_amount target
        if ($transaction->type === Transaction::TYPE_SAVING) {
            return $this->updateSavingTransaction($transaction, $validated);
        }

        $transaction->update($validated);

        return $this->successResponse(
            new TransactionResource($transaction),
            'Transaksi berhasil diperbarui'
        );
    }

    /**
     * Hapus transaksi.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $this->ensureOwned($request, $transaction);

        if ($transaction->type === Transaction::TYPE_SAVING && $transaction->saving_goal_id) {
            return $this->deleteSavingTransaction($transaction);
        }

        $transaction->delete();

        return $this->successResponse(null, 'Transaksi berhasil dihapus');
    }

    /**
     * Transaksi pengguna lain tidak boleh terlihat sehingga dibalas 404,
     * bukan 403, agar keberadaan data orang lain tidak bocor (PRD §49).
     */
    private function ensureOwned(Request $request, Transaction $transaction): void
    {
        abort_unless($transaction->user_id === (int) $request->user()->id, 404);
    }

    /**
     * Rentang tanggal dari filter: from/to diprioritaskan, lalu periode bawaan.
     *
     * @param  array<string, mixed>  $filters
     * @return array{0: string|null, 1: string|null}
     */
    private function resolveDateRange(array $filters): array
    {
        if (isset($filters['from']) || isset($filters['to'])) {
            return [$filters['from'] ?? null, $filters['to'] ?? null];
        }

        return match ($filters['period'] ?? null) {
            'today' => [now()->toDateString(), now()->toDateString()],
            'week' => [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()],
            'month' => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
            'last_month' => [
                now()->subMonthNoOverflow()->startOfMonth()->toDateString(),
                now()->subMonthNoOverflow()->endOfMonth()->toDateString(),
            ],
            default => [null, null],
        };
    }

    /**
     * Perbarui transaksi setoran tabungan dengan sinkronisasi target.
     */
    private function updateSavingTransaction(Transaction $transaction, array $validated): JsonResponse
    {
        return DB::transaction(function () use ($transaction, $validated) {
            $goal = SavingGoal::whereKey($transaction->saving_goal_id)
                ->lockForUpdate()
                ->firstOrFail();

            $difference = (float) $validated['amount'] - $transaction->amount;
            $newSavedAmount = $goal->saved_amount + $difference;

            if ($newSavedAmount > $goal->target_amount) {
                return $this->errorResponse('Setoran melebihi target tabungan.');
            }

            if ($difference > 0) {
                $balance = $transaction->user->balance();
                if ($difference > $balance) {
                    return $this->errorResponse('Saldo tidak mencukupi untuk menambah setoran.');
                }
            }

            $transaction->update($validated);

            $goal->saved_amount = $newSavedAmount;
            $goal->recalculateStatus();
            $goal->save();

            return $this->successResponse(
                new TransactionResource($transaction->fresh()),
                'Transaksi berhasil diperbarui'
            );
        });
    }

    /**
     * Hapus transaksi setoran tabungan dengan sinkronisasi target.
     */
    private function deleteSavingTransaction(Transaction $transaction): JsonResponse
    {
        return DB::transaction(function () use ($transaction) {
            $goal = SavingGoal::whereKey($transaction->saving_goal_id)
                ->lockForUpdate()
                ->first();

            if ($goal !== null) {
                $goal->saved_amount = max(0.0, $goal->saved_amount - $transaction->amount);
                $goal->recalculateStatus();
                $goal->save();
            }

            $transaction->delete();

            return $this->successResponse(null, 'Transaksi berhasil dihapus');
        });
    }
}
