<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\Api\PaiementController;

Route::get('/', function () {
    return view('welcome');
});

// Route pour servir les fichiers médias de storage/app/public
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!File::exists($filePath)) {
        abort(404);
    }

    $mimeType = File::mimeType($filePath) ?: 'application/octet-stream';

    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->where('path', '.*');

Route::get('/paiement/success', [PaiementController::class, 'success']);
Route::get('/paiement/cancel', [PaiementController::class, 'cancel']);