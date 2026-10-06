<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->getJson('/api/statistics')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_returns_statistics_with_current_month_by_default(): void
    {
        $user = User::factory()->create();
        $now = now();

        Transaction::factory()->income()->for($user)->create([
            'amount' => 8000000,
            'category' => 'Gaji',
            'transaction_date' => $now->toDateString(),
        ]);
        Transaction::factory()->income()->for($user)->create([
            'amount' => 2000000,
            'category' => 'Bonus',
            'transaction_date' => $now->toDateString(),
        ]);
        Transaction::factory()->for($user)->create([
            'amount' => 3000000,
            'category' => 'Makanan',
            'transaction_date' => $now->toDateString(),
        ]);
        Transaction::factory()->for($user)->create([
            'amount' => 1000000,
            'category' => 'Transportasi',
            'transaction_date' => $now->toDateString(),
        ]);
        $goal = $user->savingGoals()->create([
            'name' => 'Laptop',
            'target_amount' => 10000000,
        ]);
        Transaction::factory()->saving($goal)->for($user)->create([
            'amount' => 2000000,
            'transaction_date' => $now->toDateString(),
        ]);

        $response = $this->asUser($user)->getJson('/api/statistics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.income', 10000000)
            ->assertJsonPath('data.summary.expense', 4000000)
            ->assertJsonPath('data.summary.saving', 2000000)
            ->assertJsonPath('data.summary.balance', 4000000)
            ->assertJsonPath('data.income_categories.Gaji', 8000000)
            ->assertJsonPath('data.income_categories.Bonus', 2000000)
            ->assertJsonPath('data.expense_categories.Makanan', 3000000)
            ->assertJsonPath('data.expense_categories.Transportasi', 1000000)
            ->assertJsonPath('data.saving_categories.Tabungan', 2000000);
    }

    public function test_accepts_custom_month_and_year(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create([
            'amount' => 5000000,
            'category' => 'Gaji',
            'transaction_date' => '2025-06-15',
        ]);

        $response = $this->asUser($user)->getJson('/api/statistics?month=6&year=2025');

        $response->assertStatus(200)
            ->assertJsonPath('data.summary.income', 5000000)
            ->assertJsonPath('data.period.month', 6)
            ->assertJsonPath('data.period.year', 2025);
    }

    public function test_returns_422_when_month_is_invalid(): void
    {
        $this->asUser(User::factory()->create())
            ->getJson('/api/statistics?month=0')
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid');
    }

    public function test_returns_empty_breakdown_when_no_transactions(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->getJson('/api/statistics');

        $response->assertStatus(200)
            ->assertJsonPath('data.income_categories', [])
            ->assertJsonPath('data.expense_categories', [])
            ->assertJsonPath('data.saving_categories', []);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
