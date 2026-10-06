<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->putJson('/api/user', ['name' => 'Budi', 'email' => 'budi@example.com'])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_updates_name_and_email_200(): void
    {
        $user = User::factory()->create(['name' => 'Lama', 'email' => 'lama@example.com']);

        $response = $this->asUser($user)->putJson('/api/user', [
            'name' => 'Baru',
            'email' => 'baru@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Profil berhasil diperbarui')
            ->assertJsonPath('data.name', 'Baru')
            ->assertJsonPath('data.email', 'baru@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Baru',
            'email' => 'baru@example.com',
        ]);
    }

    public function test_keeps_own_email_when_email_is_unchanged_200(): void
    {
        $user = User::factory()->create(['email' => 'tetap@example.com']);

        $this->asUser($user)->putJson('/api/user', [
            'name' => $user->name,
            'email' => 'tetap@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('data.email', 'tetap@example.com');
    }

    public function test_returns_422_when_email_belongs_to_another_user(): void
    {
        User::factory()->create(['email' => 'dipakai@example.com']);
        $user = User::factory()->create();

        $this->asUser($user)->putJson('/api/user', [
            'name' => $user->name,
            'email' => 'dipakai@example.com',
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonPath('errors.email.0', 'Email sudah digunakan oleh akun lain.');
    }

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        $this->asUser(User::factory()->create())->putJson('/api/user', [])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Data tidak valid')
            ->assertJsonValidationErrors(['name', 'email']);
    }

    public function test_returns_422_when_email_format_is_invalid(): void
    {
        $this->asUser(User::factory()->create())->putJson('/api/user', [
            'name' => 'Budi',
            'email' => 'bukan-email',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    private function asUser(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$user->createToken('auth')->plainTextToken);
    }
}
