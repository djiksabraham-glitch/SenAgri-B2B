<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\Api\PaiementController;

Route::get('/', function () {
    return view('welcome');
});

// Route de secours pour servir les fichiers médias de storage/app/public sous Windows
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!File::exists($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*');

Route::get('/paiement/success', [PaiementController::class, 'success']);
Route::get('/paiement/cancel', [PaiementController::class, 'cancel']);