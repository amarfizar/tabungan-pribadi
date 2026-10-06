<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** @return HasMany<Transaction> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /** @return HasMany<SavingGoal> */
    public function savingGoals(): HasMany
    {
        return $this->hasMany(SavingGoal::class);
    }

    /**
     * Saldo tersedia = total pemasukan - pengeluaran - tabungan (PRD §12).
     *
     * Tabungan dihitung keluar dari saldo karena uangnya dipindahkan ke
     * target, bukan menjadi pengeluaran konsumtif.
     */
    public function balance(): float
    {
        $totals = $this->transactions()
            ->selectRaw('type, COALESCE(SUM(amount), 0) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $income = (float) ($totals[Transaction::TYPE_INCOME] ?? 0);
        $outgoing = (float) (
            ($totals[Transaction::TYPE_EXPENSE] ?? 0) + ($totals[Transaction::TYPE_SAVING] ?? 0)
        );

        return $income - $outgoing;
    }

    /**
     * Ringkasan transaksi per bulan (PRD §15, §28 dashboard/statistics).
     *
     * @return array{income: float, expense: float, saving: float, balance: float}
     */
    public function monthlyTotals(int $month, int $year): array
    {
        $totals = $this->transactions()
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->selectRaw('type, COALESCE(SUM(amount), 0) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $income = (float) ($totals[Transaction::TYPE_INCOME] ?? 0);
        $expense = (float) ($totals[Transaction::TYPE_EXPENSE] ?? 0);
        $saving = (float) ($totals[Transaction::TYPE_SAVING] ?? 0);

        return [
            'income' => $income,
            'expense' => $expense,
            'saving' => $saving,
            'balance' => $income - $expense - $saving,
        ];
    }

    /**
     * Breakdown kategori per bulan (PRD §15 statistics).
     *
     * @return array<string, float>
     */
    public function categoryBreakdown(int $month, int $year, string $type): array
    {
        return $this->transactions()
            ->where('type', $type)
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->selectRaw('category, COALESCE(SUM(amount), 0) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->pluck('total', 'category')
            ->map(fn ($v) => (float) $v)
            ->toArray();
    }

    /**
     * 5 transaksi terbaru (PRD §13, §28 dashboard).
     */
    public function recentTransactions(int $limit = 5)
    {
        return $this->transactions()
            ->with('savingGoal:id,name')
            ->latest('transaction_date')
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    /**
     * Target tabungan aktif (status=active) dengan progres.
     */
    public function activeGoals()
    {
        return $this->savingGoals()
            ->where('status', SavingGoal::STATUS_ACTIVE)
            ->latest('created_at')
            ->get();
    }
}
