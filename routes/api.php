<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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

Route::post(
    'paiement/callback',
    [PaiementController::class, 'callback']
);

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);


});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);

    Route::put('/profile', [ProfileController::class, 'update']);

    

    Route::apiResource('offres', OffreController::class) 
    ->parameters([
         'offres' => 'offre', ]);

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

    // Envoyer un message
    Route::post('/messages', [MessageController::class, 'store']);

    // Marquer une conversation comme lue
    Route::put('/messages/{user}/read', [MessageController::class, 'markAsRead']);

    // Supprimer un message
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    // Télécharger la facture d'une commande
     Route::get(
        '/commandes/{commande}/facture',
        [FactureController::class, 'download']
    )->name('commandes.facture');
    // Télécharger la facture PDF d'une commande
    Route::get(
        '/commandes/{commande}/facture',
        [CommandeController::class, 'facture']
    );

});


Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    Route::apiResource('categories', CategorieController::class)
    ->parameters([
        'categories' => 'categorie',
    ]);

});

Route::middleware(['auth:sanctum', 'vendeur'])->group(function () {

    Route::post('/offres', [OffreController::class, 'store']);

    Route::put('/offres/{offre}', [OffreController::class, 'update']);

    Route::delete('/offres/{offre}', [OffreController::class, 'destroy']);

});

Route::middleware(['auth:sanctum', 'acheteur'])->group(function () {

    Route::post('/commandes', [CommandeController::class, 'store']);

    Route::post('/paiements/{commande}', [PaiementController::class, 'payer']);

});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});
