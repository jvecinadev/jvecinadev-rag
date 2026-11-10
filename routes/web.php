<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $index = public_path('app/index.html');
    return file_exists($index)
        ? response()->file($index)
        : redirect('http://localhost:5173' . request()->getRequestUri());
})->where('any', '.*');