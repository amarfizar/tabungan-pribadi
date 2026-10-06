<?php

namespace Tests\Feature;

use App\Models\SavingGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoalDepositTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $goal = SavingGoal::factory()->create();

        $this->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 100000])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_deposit_updates_saved_amount_progress_and_creates_saving_transaction_201(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 5000000]);
        $goal = SavingGoal::factory()->for($user)->create(['target_amount' => 10000000]);

        $response = $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', [
            'amount' => 1500000,
            'note' => 'Setoran awal',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Setoran berhasil disimpan')
            ->assertJsonPath('data.goal.status', SavingGoal::STATUS_ACTIVE)
            ->assertJsonPath('data.transaction.type', Transaction::TYPE_SAVING)
            ->assertJsonPath('data.transaction.category', Transaction::CATEGORY_SAVING)
            ->assertJsonPath('data.transaction.saving_goal.id', $goal->id);

        $this->assertEquals(1500000.0, $response->json('data.goal.saved_amount'));
        $this->assertEquals(15.0, $response->json('data.goal.progress'));
        $this->assertEquals(1500000.0, $response->json('data.transaction.amount'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'saving_goal_id' => $goal->id,
            'type' => Transaction::TYPE_SAVING,
            'amount' => 1500000,
        ]);
    }

    public function test_deposit_reduces_available_balance(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 5000000]);
        $goal = SavingGoal::factory()->for($user)->create(['target_amount' => 10000000]);

        $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 500000])
            ->assertStatus(201);

        $response = $this->asUser($user)->getJson('/api/user')
            ->assertStatus(200);

        $this->assertEquals(4500000.0, $response->json('data.balance'));
    }

    public function test_deposit_marks_goal_completed_when_target_is_reached(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 5000000]);
        $goal = SavingGoal::factory()->for($user)->create([
            'target_amount' => 1000000,
            'saved_amount' => 800000,
        ]);

        $response = $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 200000])
            ->assertStatus(201)
            ->assertJsonPath('data.goal.status', SavingGoal::STATUS_COMPLETED);

        $this->assertEquals(1000000.0, $response->json('data.goal.saved_amount'));
        $this->assertEquals(100.0, $response->json('data.goal.progress'));
        $this->assertSame(SavingGoal::STATUS_COMPLETED, $goal->fresh()->status);
    }

    public function test_returns_422_when_balance_is_insufficient(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 100000]);
        $goal = SavingGoal::factory()->for($user)->create(['target_amount' => 10000000]);

        $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 200000])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Saldo tidak mencukupi untuk melakukan setoran.');

        $this->assertSame(0.0, (float) $goal->fresh()->saved_amount);
    }

    public function test_returns_422_when_deposit_exceeds_remaining_target(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 50000000]);
        $goal = SavingGoal::factory()->for($user)->create([
            'target_amount' => 1000000,
            'saved_amount' => 900000,
        ]);

        $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 500000])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Setoran melebihi target tabungan.');

        $this->assertSame(900000.0, (float) $goal->fresh()->saved_amount);
    }

    public function test_returns_422_when_goal_is_archived(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->income()->for($user)->create(['amount' => 5000000]);
        $goal = SavingGoal::factory()->for($user)->create(['status' => SavingGoal::STATUS_ARCHIVED]);

        $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 100000])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Target sudah diarsipkan dan tidak dapat menerima setoran.');
    }

    public function test_returns_422_when_amount_is_not_greater_than_zero(): void
    {
        $user = User::factory()->create();
        $goal = SavingGoal::factory()->for($user)->create();

        $this->asUser($user)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 0])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_returns_404_when_goal_belongs_to_another_user(): void
    {
        $goal = SavingGoal::factory()->create();
        $other = User::factory()->create();
        Transaction::factory()->income()->for($other)->create(['amount' => 5000000]);

        $this->asUser($other)->postJson('/api/goals/'.$goal->id.'/deposit', ['amount' => 100000])
            ->assertStatus(404);

        $this->assertSame(0.0, (float) $goal->fresh()->saved_amount);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
