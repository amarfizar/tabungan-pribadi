<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_deletes_own_transaction_and_returns_200(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->for($user)->create();

        $response = $this->asUser($user)->deleteJson('/api/transactions/'.$transaction->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Transaksi berhasil dihapus');

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_returns_404_and_keeps_data_when_transaction_belongs_to_another_user(): void
    {
        $transaction = Transaction::factory()->create();

        $this->asUser(User::factory()->create())
            ->deleteJson('/api/transactions/'.$transaction->id)
            ->assertStatus(404)
            ->assertJsonPath('message', 'Data tidak ditemukan.');

        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $transaction = Transaction::factory()->create();

        $this->deleteJson('/api/transactions/'.$transaction->id)
            ->assertStatus(401);

        $this->assertDatabaseCount('transactions', 1);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
