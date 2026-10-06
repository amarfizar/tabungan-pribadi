<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Resources\SavingGoalResource;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /** Jumlah kategori pengeluaran terbesar yang ditampilkan di dashboard (PRD §5.3). */
    private const TOP_EXPENSE_CATEGORIES = 5;

    /**
     * Dashboard ringkas (PRD §28).
     *
     * Query: month (1-12, default bulan sekarang), year (4 digit, default tahun sekarang).
     */
    public function index(Request $request): JsonResponse
    {
        $now = now();
        $month = (int) ($request->input('month') ?? $now->month);
        $year = (int) ($request->input('year') ?? $now->year);

        $request->validate([
            'month' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
        ]);

        $totals = $request->user()->monthlyTotals($month, $year);

        return $this->successResponse([
            'balance' => $request->user()->balance(),
            'monthly' => $totals,
            'expense_categories' => collect(
                $request->user()->categoryBreakdown($month, $year, Transaction::TYPE_EXPENSE)
            )->take(self::TOP_EXPENSE_CATEGORIES)->all(),
            'recent_transactions' => TransactionResource::collection(
                $request->user()->recentTransactions(5)
            ),
            'active_goals' => SavingGoalResource::collection(
                $request->user()->activeGoals()
            ),
        ]);
    }

    /**
     * Statistik detail per kategori (PRD §15, §28).
     *
     * Query: month, year (default bulan/tahun sekarang).
     */
    public function statistics(Request $request): JsonResponse
    {
        $now = now();
        $month = (int) ($request->input('month') ?? $now->month);
        $year = (int) ($request->input('year') ?? $now->year);

        $request->validate([
            'month' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
        ]);

        $totals = $request->user()->monthlyTotals($month, $year);

        return $this->successResponse([
            'period' => [
                'month' => $month,
                'year' => $year,
            ],
            'summary' => $totals,
            'income_categories' => $request->user()->categoryBreakdown($month, $year, Transaction::TYPE_INCOME),
            'expense_categories' => $request->user()->categoryBreakdown($month, $year, Transaction::TYPE_EXPENSE),
            'saving_categories' => $request->user()->categoryBreakdown($month, $year, Transaction::TYPE_SAVING),
        ]);
    }
}
