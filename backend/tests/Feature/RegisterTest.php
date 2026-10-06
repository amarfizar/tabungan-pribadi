<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_payload_creates_account_and_returns_token_201(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Registrasi berhasil')
            ->assertJsonPath('data.user.name', 'Budi Santoso')
            ->assertJsonPath('data.user.email', 'budi@example.com');

        $this->assertNotEmpty($response->json('data.token'));

        $user = User::where('email', 'budi@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('rahasia123', $user->password));
        $this->assertNotSame('rahasia123', $user->password);
    }

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_returns_422_with_message_when_email_is_already_registered(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Budi Lain',
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Email sudah terdaftar.');

        $this->assertDatabaseCount('users', 1);
    }

    public function test_returns_422_with_message_when_password_is_shorter_than_eight_characters(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'abc123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.password.0', 'Password minimal 8 karakter.');

        $this->assertDatabaseCount('users', 0);
    }

    public function test_returns_422_with_message_when_email_format_is_invalid(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'bukan-email',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Format email tidak valid.');
    }
}
