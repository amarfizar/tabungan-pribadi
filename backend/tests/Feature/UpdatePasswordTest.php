<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdatePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->putJson('/api/user/password', [
            'current_password' => 'password',
            'password' => 'password-baru',
            'password_confirmation' => 'password-baru',
        ])->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_updates_password_and_keeps_token_valid_200(): void
    {
        $user = User::factory()->create(['password' => 'password-lama']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/user/password', [
                'current_password' => 'password-lama',
                'password' => 'password-baru',
                'password_confirmation' => 'password-baru',
            ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Password berhasil diperbarui');

        $user->refresh();
        $this->assertTrue(Hash::check('password-baru', $user->password));
        $this->assertFalse(Hash::check('password-lama', $user->password));

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user')
            ->assertStatus(200);
    }

    public function test_returns_422_when_current_password_is_wrong(): void
    {
        $user = User::factory()->create(['password' => 'password-lama']);

        $this->asUser($user)->putJson('/api/user/password', [
            'current_password' => 'salah-satu',
            'password' => 'password-baru',
            'password_confirmation' => 'password-baru',
        ])->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Password saat ini salah.')
            ->assertJsonPath('errors.current_password.0', 'Password saat ini salah.');

        $this->assertTrue(Hash::check('password-lama', $user->fresh()->password));
    }

    public function test_returns_422_when_new_password_is_shorter_than_8_characters(): void
    {
        $user = User::factory()->create(['password' => 'password-lama']);

        $this->asUser($user)->putJson('/api/user/password', [
            'current_password' => 'password-lama',
            'password' => 'pendek',
            'password_confirmation' => 'pendek',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_returns_422_when_confirmation_does_not_match(): void
    {
        $user = User::factory()->create(['password' => 'password-lama']);

        $this->asUser($user)->putJson('/api/user/password', [
            'current_password' => 'password-lama',
            'password' => 'password-baru',
            'password_confirmation' => 'beda-total',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
