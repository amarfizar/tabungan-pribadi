<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->postJson('/api/transactions', $this->validPayload())
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_valid_payload_creates_transaction_and_returns_201(): void
    {
        $user = User::factory()->create();

        $response = $this->asUser($user)->postJson('/api/transactions', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Transaksi berhasil disimpan')
            ->assertJsonPath('data.type', 'expense')
            ->assertJsonPath('data.category', 'Makanan')
            ->assertJsonPath('data.transaction_date', now()->toDateString());

        $this->assertEquals(25000, $response->json('data.amount'));
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'expense',
            'category' => 'Makanan',
            'amount' => 25000,
            'note' => 'Makan siang',
            'saving_goal_id' => null,
        ]);
    }

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->postJson('/api/transactions', []);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['type', 'category', 'amount', 'transaction_date']);

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_returns_422_with_message_when_amount_is_not_greater_than_zero(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->postJson('/api/transactions', array_merge($this->validPayload(), ['amount' => 0]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.amount.0', 'Nominal harus lebih besar dari 0.');

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_returns_422_with_message_when_category_does_not_match_type(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->postJson('/api/transactions', array_merge($this->validPayload(), [
                'type' => 'income',
                'category' => 'Makanan',
            ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.category.0', 'Kategori tidak valid untuk jenis transaksi ini.');
    }

    public function test_returns_422_with_message_when_transaction_date_is_invalid(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->postJson('/api/transactions', array_merge($this->validPayload(), [
                'transaction_date' => 'bukan-tanggal',
            ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.transaction_date.0', 'Format tanggal tidak valid.');
    }

    public function test_returns_422_with_message_when_type_is_saving(): void
    {
        $response = $this->asUser(User::factory()->create())
            ->postJson('/api/transactions', array_merge($this->validPayload(), [
                'type' => 'saving',
                'category' => 'Tabungan',
            ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.type.0', 'Jenis transaksi tidak valid.');

        $this->assertDatabaseCount('transactions', 0);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'type' => 'expense',
            'category' => 'Makanan',
            'amount' => 25000,
            'note' => 'Makan siang',
            'transaction_date' => now()->toDateString(),
        ];
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
