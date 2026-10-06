<?php

namespace Database\Factories;

use App\Models\SavingGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingGoal>
 */
class SavingGoalFactory extends Factory
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
            'name' => ucfirst(fake()->words(2, true)),
            'target_amount' => fake()->randomFloat(2, 1000000, 10000000),
            'saved_amount' => 0,
            'deadline' => null,
            'status' => SavingGoal::STATUS_ACTIVE,
        ];
    }

    /**
     * Target yang sudah tercapai.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SavingGoal::STATUS_COMPLETED,
            'saved_amount' => $attributes['target_amount'],
        ]);
    }
}
