<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Aplikasi API-only: tidak ada halaman login, tamu yang belum
        // autentikasi selalu menerima respons 401 JSON (PRD §38).
        $middleware->redirectGuestsTo(null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Pesan 404 yang ramah untuk resource API (PRD §38).
        $notFoundMessage = static function (NotFoundHttpException $exception): string {
            $previous = $exception->getPrevious();

            if ($previous instanceof ModelNotFoundException) {
                return match (class_basename($previous->getModel())) {
                    'SavingGoal' => 'Target tabungan tidak ditemukan.',
                    'Transaction' => 'Transaksi tidak ditemukan.',
                    default => 'Data tidak ditemukan.',
                };
            }

            return $exception->getMessage() !== '' ? $exception->getMessage() : 'Data tidak ditemukan.';
        };

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Semua error API memakai amplop yang sama seperti respons sukses (PRD §39).
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Data tidak valid',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Sesi Anda telah berakhir. Silakan login kembali.',
                'errors' => [],
            ], 401);
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($notFoundMessage) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => $notFoundMessage($exception),
                'errors' => [],
            ], 404);
        });

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
                'errors' => [],
            ], 429);
        });
    })->create();
