<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_revokes_current_token_and_returns_200(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Berhasil logout');

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Guard Sanctum meng-cache user pada instance aplikasi. Dalam produksi
        // tiap request mem-boot aplikasi baru, sehingga perlu di-reset di test.
        $this->app->make('auth')->forgetGuards();

        $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    public function test_returns_401_when_no_token_is_provided(): void
    {
        $this->postJson('/api/logout')
            ->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Sesi Anda telah berakhir. Silakan login kembali.');
    }
}
