<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;

/**
 * Amplop response API yang konsisten sesuai PRD bagian 39.
 *
 * Sukses : {"success": true,  "message": "...", "data": {...}}
 * Gagal  : {"success": false, "message": "...", "errors": {...}}
 *
 * @phpstan-type ErrorBag array<string, list<string>>
 */
trait ApiResponse
{
    /**
     * @param  mixed  $data  Payload utama respons.
     */
    protected function successResponse(mixed $data = null, string $message = 'Berhasil', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * @param  ErrorBag  $errors  Kesalahan per field, kosong bila bukan masalah validasi.
     */
    protected function errorResponse(string $message, array $errors = [], int $status = 422): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
