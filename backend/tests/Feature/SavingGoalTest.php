<?php

namespace Tests\Feature;

use App\Models\SavingGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingGoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->getJson('/api/goals')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_lists_only_own_goals_with_progress_200(): void
    {
        $user = User::factory()->create();
        $own = SavingGoal::factory()->for($user)->create([
            'name' => 'Laptop',
            'target_amount' => 10000000,
            'saved_amount' => 4000000,
        ]);
        SavingGoal::factory()->create();

        $response = $this->asUser($user)->getJson('/api/goals');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $own->id)
            ->assertJsonPath('data.0.status', SavingGoal::STATUS_ACTIVE);

        $this->assertEquals(40.0, $response->json('data.0.progress'));
    }

    public function test_filters_goals_by_status_200(): void
    {
        $user = User::factory()->create();
        SavingGoal::factory()->for($user)->create();
        SavingGoal::factory()->completed()->for($user)->create();

        $this->asUser($user)->getJson('/api/goals?status=completed')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', SavingGoal::STATUS_COMPLETED);
    }

    public function test_creates_goal_as_active_201(): void
    {
        $user = User::factory()->create();

        $response = $this->asUser($user)->postJson('/api/goals', [
            'name' => 'Laptop',
            'target_amount' => 10000000,
            'deadline' => '2027-01-01',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Target tabungan berhasil dibuat')
            ->assertJsonPath('data.name', 'Laptop')
            ->assertJsonPath('data.status', SavingGoal::STATUS_ACTIVE);

        $this->assertEquals(10000000.0, $response->json('data.target_amount'));
        $this->assertEquals(0.0, $response->json('data.saved_amount'));
        $this->assertEquals(0.0, $response->json('data.progress'));

        $this->assertDatabaseHas('saving_goals', [
            'user_id' => $user->id,
            'name' => 'Laptop',
            'status' => SavingGoal::STATUS_ACTIVE,
        ]);
    }

    public function test_returns_422_when_target_amount_is_not_greater_than_zero(): void
    {
        $this->asUser(User::factory()->create())
            ->postJson('/api/goals', ['name' => 'Laptop', 'target_amount' => 0])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['target_amount']);
    }

    public function test_returns_422_when_name_is_missing(): void
    {
        $this->asUser(User::factory()->create())
            ->postJson('/api/goals', ['target_amount' => 1000000])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_shows_own_goal_200(): void
    {
        $user = User::factory()->create();
        $goal = SavingGoal::factory()->for($user)->create(['name' => 'Liburan']);

        $this->asUser($user)->getJson('/api/goals/'.$goal->id)
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Liburan');
    }

    public function test_returns_404_when_goal_belongs_to_another_user(): void
    {
        $goal = SavingGoal::factory()->create();
        $other = User::factory()->create();

        $this->asUser($other)->getJson('/api/goals/'.$goal->id)
            ->assertStatus(404);

        $this->asUser($other)
            ->putJson('/api/goals/'.$goal->id, ['name' => 'Diambil'])
            ->assertStatus(404);

        $this->asUser($other)
            ->deleteJson('/api/goals/'.$goal->id)
            ->assertStatus(404);
    }

    public function test_updates_goal_200(): void
    {
        $user = User::factory()->create();
        $goal = SavingGoal::factory()->for($user)->create();

        $response = $this->asUser($user)->putJson('/api/goals/'.$goal->id, [
            'name' => 'Laptop Baru',
            'target_amount' => 15000000,
            'deadline' => '2027-06-30',
            'status' => SavingGoal::STATUS_ARCHIVED,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Laptop Baru')
            ->assertJsonPath('data.status', SavingGoal::STATUS_ARCHIVED);

        $this->assertEquals(15000000.0, $response->json('data.target_amount'));
    }

    public function test_deletes_goal_and_its_saving_transactions_200(): void
    {
        $user = User::factory()->create();
        $goal = SavingGoal::factory()->for($user)->create([
            'target_amount' => 1000000,
            'saved_amount' => 300000,
        ]);
        Transaction::factory()->saving($goal)->for($user)->create(['amount' => 300000]);

        $this->asUser($user)->deleteJson('/api/goals/'.$goal->id)
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Target tabungan berhasil dihapus');

        $this->assertDatabaseMissing('saving_goals', ['id' => $goal->id]);
        $this->assertDatabaseMissing('transactions', ['saving_goal_id' => $goal->id]);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
