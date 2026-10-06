<?php

namespace App\Models;

use Database\Factories\SavingGoalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'target_amount', 'deadline', 'status'])]
class SavingGoal extends Model
{
    /** @use HasFactory<SavingGoalFactory> */
    use HasFactory;

    /** Target masih dapat disetor. */
    public const STATUS_ACTIVE = 'active';

    /** Target sudah memenuhi nominal yang dituju. */
    public const STATUS_COMPLETED = 'completed';

    /** Target disembunyikan dari daftar aktif tanpa menghapus riwayatnya. */
    public const STATUS_ARCHIVED = 'archived';

    /** @var list<string> */
    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_COMPLETED, self::STATUS_ARCHIVED];

    /**
     * Nilai default kolom yang sama dengan default pada migration.
     *
     * @var array<string, string>
     */
    protected $attributes = [
        'saved_amount' => '0',
        'status' => self::STATUS_ACTIVE,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'target_amount' => 'float',
            'saved_amount' => 'float',
            'deadline' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Setoran target disimpan sebagai transaksi bertipe saving. */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'saving_goal_id');
    }

    /**
     * Persentase progres target, dibatasi 100%.
     */
    public function progressPercentage(): float
    {
        if ($this->target_amount <= 0) {
            return 0.0;
        }

        return min(100.0, round(($this->saved_amount / $this->target_amount) * 100, 2));
    }
}
