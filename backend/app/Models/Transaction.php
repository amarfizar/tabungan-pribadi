<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Date;

#[Fillable(['type', 'category', 'amount', 'note', 'transaction_date'])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    /** Pemasukan: menambah saldo. */
    public const TYPE_INCOME = 'income';

    /** Pengeluaran: mengurangi saldo. */
    public const TYPE_EXPENSE = 'expense';

    /** Tabungan: memindahkan saldo ke target tabungan. */
    public const TYPE_SAVING = 'saving';

    /** @var list<string> */
    public const TYPES = [self::TYPE_INCOME, self::TYPE_EXPENSE, self::TYPE_SAVING];

    /** Kategori bawaan untuk setoran tabungan. */
    public const CATEGORY_SAVING = 'Tabungan';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'saving_goal_id' => 'integer',
            'amount' => 'float',
            'transaction_date' => 'date',
        ];
    }

    /**
     * Batasi transaksi pada jenis tertentu (semua, pemasukan, pengeluaran, tabungan).
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Batasi transaksi pada rentang tanggal, batas atas/bawah bersifat opsional.
     *
     * Batas atas dibandingkan dengan hari berikutnya karena kolom DATE dapat
     * disimpan beserta waktu 00:00:00, sehingga perbandingan "<=" terhadap
     * tanggal murni bisa meleset. Pemakaian operator polos tetap memakai index.
     */
    #[Scope]
    protected function betweenDates(Builder $query, ?string $from = null, ?string $to = null): Builder
    {
        if ($from !== null) {
            $query->where('transaction_date', '>=', $from);
        }

        if ($to !== null) {
            $query->where('transaction_date', '<', Date::parse($to)->addDay()->toDateString());
        }

        return $query;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function savingGoal(): BelongsTo
    {
        return $this->belongsTo(SavingGoal::class, 'saving_goal_id');
    }
}
