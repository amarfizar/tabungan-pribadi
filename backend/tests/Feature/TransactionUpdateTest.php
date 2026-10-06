<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_payload_updates_transaction_and_returns_200(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->for($user)->create([
            'type' => 'expense',
            'category' => 'Makanan',
            'amount' => 25000,
        ]);

        $response = $this->asUser($user)->putJson('/api/transactions/'.$transaction->id, [
            'type' => 'income',
            'category' => 'Bonus',
            'amount' => 500000,
            'note' => 'Bonus lembur',
            'transaction_date' => '2026-10-05',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Transaksi berhasil diperbarui')
            ->assertJsonPath('data.type', 'income')
            ->assertJsonPath('data.category', 'Bonus')
            ->assertJsonPath('data.note', 'Bonus lembur')
            ->assertJsonPath('data.transaction_date', '2026-10-05');

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'type' => 'income',
            'category' => 'Bonus',
            'amount' => 500000,
        ]);
    }

    public function test_returns_422_with_message_when_amount_is_invalid(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->for($user)->create();

        $response = $this->asUser($user)->putJson('/api/transactions/'.$transaction->id, [
            'type' => 'expense',
            'category' => 'Makanan',
            'amount' => -1000,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.amount.0', 'Nominal harus lebih besar dari 0.');

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'amount' => $transaction->amount,
        ]);
    }

    public function test_returns_422_with_message_when_type_is_saving(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->for($user)->create();

        $this->asUser($user)->putJson('/api/transactions/'.$transaction->id, [
            'type' => 'saving',
            'category' => 'Tabungan',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
        ])->assertStatus(422)
            ->assertJsonPath('errors.type.0', 'Jenis transaksi tidak valid.');
    }

    public function test_returns_404_and_keeps_data_when_transaction_belongs_to_another_user(): void
    {
        $transaction = Transaction::factory()->create(['amount' => 77777]);

        $this->asUser(User::factory()->create())
            ->putJson('/api/transactions/'.$transaction->id, [
                'type' => 'expense',
                'category' => 'Belanja',
                'amount' => 1,
                'transaction_date' => now()->toDateString(),
            ])
            ->assertStatus(404)
            ->assertJsonPath('message', 'Data tidak ditemukan.');

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'amount' => 77777,
        ]);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
