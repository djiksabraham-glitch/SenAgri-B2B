<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\OffreController;
use App\Http\Controllers\Api\ImageProduitController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\PaiementController;

// ==========================================================
// Route publique pour servir les fichiers du storage
// (contournement php artisan serve qui bloque les symlinks)
// ==========================================================
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

Route::post(
    'paiement/callback',
    [PaiementController::class, 'callback']
)->middleware('throttle:30,1');

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');

    Route::post('/login', [AuthController::class, 'login'])->name('login')->middleware('throttle:login');

    // Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');

});

// Routes publiques pour consulter les offres et catégories
Route::get('/offres', [OffreController::class, 'index']);
Route::get('/offres/{offre}', [OffreController::class, 'show']);
Route::get('/categories', [CategorieController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);

    Route::put('/profile', [ProfileController::class, 'update']);

    Route::post('/offres/{offre}/images', [ImageProduitController::class, 'store']);
    Route::delete('/images/{imageProduit}', [ImageProduitController::class, 'destroy']);

    Route::apiResource('commandes', CommandeController::class);

    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/statistiques', [StatistiqueController::class, 'index']);

    Route::get('/profil', [ProfileController::class, 'me']);

    Route::put('/profil', [ProfileController::class, 'update']);

    Route::post('/profil/photo', [ProfileController::class, 'uploadPhoto']);

    Route::delete('/profil/photo', [ProfileController::class, 'destroyPhoto']);

    Route::get('/notifications', [NotificationController::class, 'index']);

    Route::patch('/notifications/{id}/read', [NotificationController::class, 'read']);

    Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);

   // Liste des conversations
    Route::get('/messages', [MessageController::class, 'index']);

    // Conversation avec un utilisateur
    Route::get('/messages/{user}', [MessageController::class, 'conversation']);

    // Envoyer un message (limite anti-spam)
    Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:messages');

    // Marquer une conversation comme lue
    Route::put('/messages/{user}/read', [MessageController::class, 'markAsRead']);

    // Supprimer un message
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);

    // Télécharger la facture PDF d'une commande
    Route::get(
        '/commandes/{commande}/facture',
        [FactureController::class, 'download']
    )->name('commandes.facture');

});


use App\Http\Controllers\Api\UserController;

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    Route::apiResource('categories', CategorieController::class)
    ->except(['index', 'show'])
    ->parameters([
        'categories' => 'categorie',
    ]);

    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/toggle-actif', [UserController::class, 'toggleActif']);

    Route::delete('/admin/offres/{offre}', [App\Http\Controllers\Api\OffreController::class, 'destroy']);

});

Route::middleware(['auth:sanctum', 'vendeur'])->group(function () {

    Route::post('/offres', [OffreController::class, 'store']);

    Route::put('/offres/{offre}', [OffreController::class, 'update']);

    Route::delete('/offres/{offre}', [OffreController::class, 'destroy']);

});

Route::middleware(['auth:sanctum', 'acheteur'])->group(function () {

    Route::post('/commandes', [CommandeController::class, 'store']);

    Route::post('/paiements/{commande}', [PaiementController::class, 'payer'])->middleware('throttle:paiement');

});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});
