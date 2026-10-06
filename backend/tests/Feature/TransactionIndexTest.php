<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->getJson('/api/transactions')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_lists_only_own_transactions_with_default_pagination_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(25)->for($user)->create();
        Transaction::factory()->count(3)->create();

        $response = $this->asUser($user)->getJson('/api/transactions');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 25)
            ->assertJsonPath('data.per_page', 20)
            ->assertJsonPath('data.current_page', 1)
            ->assertJsonPath('data.last_page', 2);

        $this->assertCount(20, $response->json('data.items'));
    }

    public function test_honors_per_page_and_page_parameters_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(12)->for($user)->create();

        $response = $this->asUser($user)->getJson('/api/transactions?per_page=5&page=2');

        $response->assertStatus(200)
            ->assertJsonPath('data.per_page', 5)
            ->assertJsonPath('data.current_page', 2)
            ->assertJsonPath('data.total', 12)
            ->assertJsonPath('data.last_page', 3);

        $this->assertCount(5, $response->json('data.items'));
    }

    public function test_filters_by_type_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(2)->income()->for($user)->create();
        Transaction::factory()->count(3)->for($user)->create();

        $response = $this->asUser($user)->getJson('/api/transactions?type=income');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 2);

        foreach ($response->json('data.items') as $item) {
            $this->assertSame('income', $item['type']);
        }
    }

    public function test_filters_by_period_today_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->for($user)->create(['transaction_date' => now()->toDateString()]);
        Transaction::factory()->for($user)->create(['transaction_date' => now()->subDay()->toDateString()]);

        $this->asUser($user)->getJson('/api/transactions?period=today')
            ->assertStatus(200)
            ->assertJsonPath('data.total', 1);
    }

    public function test_filters_by_custom_date_range_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->for($user)->create(['transaction_date' => now()->subDays(10)->toDateString()]);
        Transaction::factory()->for($user)->create(['transaction_date' => now()->subDays(2)->toDateString()]);
        Transaction::factory()->for($user)->create(['transaction_date' => now()->toDateString()]);

        $query = http_build_query([
            'from' => now()->subDays(3)->toDateString(),
            'to' => now()->toDateString(),
        ]);

        $this->asUser($user)->getJson('/api/transactions?'.$query)
            ->assertStatus(200)
            ->assertJsonPath('data.total', 2);
    }

    public function test_filters_by_category_200(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->for($user)->create(['type' => 'expense', 'category' => 'Makanan']);
        Transaction::factory()->for($user)->create(['type' => 'expense', 'category' => 'Transportasi']);

        $response = $this->asUser($user)->getJson('/api/transactions?type=expense&category=Makanan');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.category', 'Makanan');
    }

    public function test_returns_422_with_message_when_period_is_invalid(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->getJson('/api/transactions?period=tahun-ini');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonPath('errors.period.0', 'Periode tidak valid.');
    }

    public function test_includes_saving_goal_for_saving_transactions_200(): void
    {
        $user = User::factory()->create();
        $goal = $user->savingGoals()->create([
            'name' => 'Laptop',
            'target_amount' => 10000000,
        ]);
        Transaction::factory()->saving($goal)->for($user)->create(['amount' => 500000]);
        Transaction::factory()->for($user)->create();

        $response = $this->asUser($user)->getJson('/api/transactions?type=saving');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.saving_goal.name', 'Laptop')
            ->assertJsonPath('data.items.0.saving_goal.id', $goal->id);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
