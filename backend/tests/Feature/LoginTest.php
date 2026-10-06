<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_credentials_return_token_and_user_200(): void
    {
        $user = User::factory()->create(['email' => 'budi@example.com']);

        $response = $this->postJson('/api/login', [
            'email' => 'budi@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login berhasil')
            ->assertJsonPath('data.user.email', 'budi@example.com');

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeaders(['Authorization' => 'Bearer '.$response->json('data.token')])
            ->getJson('/api/user')
            ->assertStatus(200)
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_returns_422_with_message_when_password_is_incorrect(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $response = $this->postJson('/api/login', [
            'email' => 'budi@example.com',
            'password' => 'salah-banget',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Email atau password salah.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_returns_422_with_message_when_email_is_not_registered(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'tidak-ada@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Email atau password salah.');
    }

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        $this->postJson('/api/login', [])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_returns_429_when_attempts_exceed_rate_limit(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/login', [
                'email' => 'budi@example.com',
                'password' => 'salah-banget',
            ])->assertStatus(422);
        }

        $this->postJson('/api/login', [
            'email' => 'budi@example.com',
            'password' => 'salah-banget',
        ])->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Terlalu banyak permintaan. Silakan coba lagi nanti.');
    }
}
