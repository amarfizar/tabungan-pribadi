<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SavingGoalController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Autentikasi memakai Sanctum token (PRD §28). Setiap endpoint di bawah
| auth:sanctum hanya mengembalikan data milik pengguna yang login.
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('transactions', TransactionController::class)->except(['create', 'edit']);

    Route::apiResource('goals', SavingGoalController::class)->except(['create', 'edit']);
    Route::post('/goals/{goal}/deposit', [SavingGoalController::class, 'deposit']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/statistics', [DashboardController::class, 'statistics']);
});
