<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
            'amount' => 'float',
            'transaction_date' => 'date',
        ];
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
