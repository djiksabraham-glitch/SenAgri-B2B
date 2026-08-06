<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaiementController;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/paiement/success', [PaiementController::class, 'success']);
Route::get('/paiement/cancel', [PaiementController::class, 'cancel']);