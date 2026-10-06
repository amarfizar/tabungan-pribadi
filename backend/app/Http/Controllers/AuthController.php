<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Membuat akun baru lalu langsung mengeluarkan token (PRD §5.1).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 100 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 150 karakter.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
        ]);

        $user = User::create($validated);

        return $this->successResponse([
            'token' => $user->createToken('auth')->plainTextToken,
            'user' => new UserResource($user),
        ], 'Registrasi berhasil', 201);
    }

    /**
     * Mengautentikasi pengguna lalu mengeluarkan token (PRD §5.2).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse('Email atau password salah.');
        }

        return $this->successResponse([
            'token' => $user->createToken('auth')->plainTextToken,
            'user' => new UserResource($user),
        ], 'Login berhasil');
    }

    /**
     * Mencabut token yang sedang dipakai (PRD §5.2).
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return $this->successResponse(null, 'Berhasil logout');
    }

    /**
     * Mengambil profil pengguna yang sedang login.
     */
    public function user(Request $request): JsonResponse
    {
        return $this->successResponse(new UserResource($request->user()));
    }

    /**
     * Memperbarui nama dan email pengguna yang login (PRD §22).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($request->user()->id),
            ],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 100 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 150 karakter.',
            'email.unique' => 'Email sudah digunakan oleh akun lain.',
        ]);

        $user = $request->user();
        $user->fill($validated);
        $user->save();

        return $this->successResponse(new UserResource($user), 'Profil berhasil diperbarui');
    }

    /**
     * Mengubah password pengguna yang login (PRD §22).
     *
     * Token yang sedang dipakai tetap valid agar pengguna tidak
     * langsung keluar setelah mengganti password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return $this->errorResponse(
                'Password saat ini salah.',
                ['current_password' => ['Password saat ini salah.']],
                422
            );
        }

        $user->password = $validated['password'];
        $user->save();

        return $this->successResponse(null, 'Password berhasil diperbarui');
    }
}
