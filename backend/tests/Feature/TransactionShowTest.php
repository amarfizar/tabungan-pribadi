<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $transaction = Transaction::factory()->create();

        $this->getJson('/api/transactions/'.$transaction->id)
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_returns_transaction_200(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->for($user)->create([
            'type' => 'income',
            'category' => 'Gaji',
            'amount' => 3000000,
            'note' => 'Gaji Oktober',
            'transaction_date' => '2026-10-01',
        ]);

        $this->asUser($user)->getJson('/api/transactions/'.$transaction->id)
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $transaction->id)
            ->assertJsonPath('data.type', 'income')
            ->assertJsonPath('data.category', 'Gaji')
            ->assertJsonPath('data.note', 'Gaji Oktober')
            ->assertJsonPath('data.transaction_date', '2026-10-01')
            ->assertJsonPath('data.saving_goal', null);
    }

    public function test_returns_404_when_transaction_belongs_to_another_user(): void
    {
        $transaction = Transaction::factory()->create();

        $this->asUser(User::factory()->create())
            ->getJson('/api/transactions/'.$transaction->id)
            ->assertStatus(404)
            ->assertJsonPath('message', 'Data tidak ditemukan.');
    }

    public function test_returns_404_when_transaction_does_not_exist(): void
    {
        $this->asUser(User::factory()->create())
            ->getJson('/api/transactions/999999')
            ->assertStatus(404);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
