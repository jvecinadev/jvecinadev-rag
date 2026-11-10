<?php

use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\PortfolioController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'db' => DB::connection()->getDatabaseName(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/projects', [PortfolioController::class, 'projects']);
Route::get('/projects/{slug}', [PortfolioController::class, 'project']);
Route::get('/posts', [PortfolioController::class, 'posts']);
Route::get('/experience', [PortfolioController::class, 'experience']);

Route::post('/chat', [ChatController::class, 'chat']);
Route::post('/chat/feedback', [ChatController::class, 'feedback']);