<?php

namespace Database\Factories;

use App\Models\SavingGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => Transaction::TYPE_EXPENSE,
            'category' => fake()->randomElement((array) config('categories.expense')),
            'amount' => fake()->randomFloat(2, 5000, 250000),
            'note' => fake()->optional()->sentence(3),
            'transaction_date' => now()->toDateString(),
        ];
    }

    /**
     * Transaksi pemasukan dengan kategori yang valid.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => Transaction::TYPE_INCOME,
            'category' => fake()->randomElement((array) config('categories.income')),
            'amount' => fake()->randomFloat(2, 100000, 5000000),
        ]);
    }

    /**
     * Setoran tabungan yang terikat pada sebuah target.
     */
    public function saving(SavingGoal $goal): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => Transaction::TYPE_SAVING,
            'category' => Transaction::CATEGORY_SAVING,
            'user_id' => $goal->user_id,
            'saving_goal_id' => $goal->getKey(),
        ]);
    }
}
