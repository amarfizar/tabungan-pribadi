<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->getJson('/api/dashboard')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_returns_dashboard_with_current_month_by_default(): void
    {
        $user = User::factory()->create();
        $now = now();

        // Data bulan ini
        Transaction::factory()->count(2)->income()->for($user)->create([
            'amount' => 5000000,
            'transaction_date' => $now->toDateString(),
        ]);
        Transaction::factory()->count(3)->for($user)->create([
            'amount' => 1500000,
            'transaction_date' => $now->toDateString(),
        ]);
        Transaction::factory()->saving($user->savingGoals()->create([
            'name' => 'Laptop',
            'target_amount' => 10000000,
        ]))->for($user)->create([
            'amount' => 2000000,
            'transaction_date' => $now->toDateString(),
        ]);

        // Data bulan lalu (harus tidak terhitung di monthly)
        Transaction::factory()->income()->for($user)->create([
            'amount' => 10000000,
            'transaction_date' => $now->subMonth()->toDateString(),
        ]);

        $response = $this->asUser($user)->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.monthly.income', 10000000)
            ->assertJsonPath('data.monthly.expense', 4500000)
            ->assertJsonPath('data.monthly.saving', 2000000)
            ->assertJsonPath('data.monthly.balance', 3500000)
            ->assertJsonPath('data.balance', 13500000); // all-time balance

        $response->assertJsonStructure([
            'data' => [
                'balance',
                'monthly' => ['income', 'expense', 'saving', 'balance'],
                'recent_transactions' => [],
                'active_goals' => [],
            ],
        ]);
    }

    public function test_accepts_custom_month_and_year(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create([
            'amount' => 5000000,
            'transaction_date' => '2025-06-15',
        ]);

        $response = $this->asUser($user)->getJson('/api/dashboard?month=6&year=2025');

        $response->assertStatus(200)
            ->assertJsonPath('data.monthly.income', 5000000);
    }

    public function test_returns_422_when_month_is_invalid(): void
    {
        $this->asUser(User::factory()->create())
            ->getJson('/api/dashboard?month=13')
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonPath('errors.month.0', 'The month field must not be greater than 12.');
    }

    public function test_includes_active_goals_with_progress(): void
    {
        $user = User::factory()->create();
        $goal = $user->savingGoals()->create([
            'name' => 'Laptop',
            'target_amount' => 10000000,
            'status' => 'active',
        ]);
        $goal->forceFill(['saved_amount' => 3000000])->save();

        $user->savingGoals()->create([
            'name' => 'Arsip',
            'target_amount' => 5000000,
            'status' => 'archived',
        ]);

        $response = $this->asUser($user)->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.active_goals.0.name', 'Laptop')
            ->assertJsonPath('data.active_goals.0.progress', 30)
            ->assertJsonCount(1, 'data.active_goals');
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
