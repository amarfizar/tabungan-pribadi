<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\DepositRequest;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Resources\SavingGoalResource;
use App\Models\SavingGoal;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SavingGoalController extends Controller
{
    use ApiResponse;

    /**
     * Daftar target tabungan milik pengguna.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(SavingGoal::STATUSES)],
        ], [
            'status.in' => 'Status target tidak valid.',
        ]);

        $query = $request->user()->savingGoals()->latest('created_at');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $this->successResponse(SavingGoalResource::collection($query->get()));
    }

    /**
     * Membuat target tabungan baru (PRD §10).
     */
    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = $request->user()->savingGoals()->create($request->validated());

        return $this->successResponse(
            new SavingGoalResource($goal),
            'Target tabungan berhasil dibuat',
            201
        );
    }

    /**
     * Detail target tabungan.
     */
    public function show(Request $request, SavingGoal $goal): JsonResponse
    {
        $this->ensureOwned($request, $goal);

        return $this->successResponse(new SavingGoalResource($goal));
    }

    /**
     * Memperbarui target tabungan.
     */
    public function update(UpdateGoalRequest $request, SavingGoal $goal): JsonResponse
    {
        $this->ensureOwned($request, $goal);

        $goal->fill($request->validated());
        $goal->recalculateStatus();
        $goal->save();

        return $this->successResponse(
            new SavingGoalResource($goal),
            'Target tabungan berhasil diperbarui'
        );
    }

    /**
     * Menghapus target tabungan beserta setoran terkaitnya (PRD §11).
     */
    public function destroy(Request $request, SavingGoal $goal): JsonResponse
    {
        $this->ensureOwned($request, $goal);

        $goal->delete(); // FK cascade menghapus transaksi tabungan terkait

        return $this->successResponse(null, 'Target tabungan berhasil dihapus');
    }

    /**
     * Menyetorkan uang ke target tabungan (PRD §11).
     */
    public function deposit(DepositRequest $request, SavingGoal $goal): JsonResponse
    {
        $this->ensureOwned($request, $goal);

        $validated = $request->validated();
        $amount = (float) $validated['amount'];

        return DB::transaction(function () use ($request, $goal, $validated, $amount) {
            $goal = SavingGoal::whereKey($goal->getKey())->lockForUpdate()->firstOrFail();

            if ($goal->status === SavingGoal::STATUS_ARCHIVED) {
                return $this->errorResponse('Target sudah diarsipkan dan tidak dapat menerima setoran.');
            }

            $balance = $request->user()->balance();
            if ($amount > $balance) {
                return $this->errorResponse('Saldo tidak mencukupi untuk melakukan setoran.');
            }

            if ($goal->saved_amount + $amount > $goal->target_amount) {
                return $this->errorResponse('Setoran melebihi target tabungan.');
            }

            $transaction = new Transaction([
                'type' => Transaction::TYPE_SAVING,
                'category' => Transaction::CATEGORY_SAVING,
                'amount' => $amount,
                'note' => $validated['note'] ?? null,
                'transaction_date' => $validated['transaction_date'] ?? now()->toDateString(),
            ]);
            $transaction->saving_goal_id = $goal->getKey();
            $request->user()->transactions()->save($transaction);

            $goal->saved_amount += $amount;
            $goal->recalculateStatus();
            $goal->save();

            return $this->successResponse([
                'goal' => new SavingGoalResource($goal),
                'transaction' => new TransactionResource($transaction),
            ], 'Setoran berhasil disimpan', 201);
        });
    }

    /**
     * Memastikan target milik pengguna yang login (PRD §23, §49).
     */
    private function ensureOwned(Request $request, SavingGoal $goal): void
    {
        abort_unless($goal->user_id === (int) $request->user()->id, 404);
    }
}
