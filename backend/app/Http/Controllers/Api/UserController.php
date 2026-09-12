<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Liste de tous les utilisateurs (pour Admin).
     */
    public function index(): JsonResponse
    {
        $users = User::with('photoProfil')
            ->withCount(['offres', 'commandes'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * Afficher un utilisateur.
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['photoProfil', 'offres', 'commandes']);

        return response()->json([
            'data' => $user
        ]);
    }

    /**
     * Suspendre ou Activer le compte d'un utilisateur (Toggle est_actif).
     */
    public function toggleActif(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas suspendre votre propre compte.'
            ], 403);
        }

        $ancienStatut = $user->est_actif;
        $user->est_actif = !$user->est_actif;
        $user->save();

        $action = $user->est_actif ? 'Réactivation' : 'Suspension';

        AuditLogService::log(
            auth()->user(),
            $action,
            'users',
            $user->id,
            ['est_actif' => $ancienStatut],
            ['est_actif' => $user->est_actif]
        );

        $message = $user->est_actif 
            ? "Le compte de {$user->nom} a été réactivé avec succès." 
            : "Le compte de {$user->nom} a été suspendu.";

        return response()->json([
            'message' => $message,
            'data' => $user->fresh('photoProfil')
        ]);
    }

    /**
     * Mettre à jour le rôle ou les infos d'un utilisateur.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|nullable|string|max:20',
            'adresse' => 'sometimes|nullable|string|max:255',
            'role' => 'sometimes|string|in:admin,vendeur,acheteur,producteur',
            'est_actif' => 'sometimes|boolean',
        ]);

        $ancien = $user->toArray();
        $user->update($validated);

        AuditLogService::log(
            auth()->user(),
            'Modification',
            'users',
            $user->id,
            $ancien,
            $user->fresh()->toArray()
        );

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'data' => $user->fresh('photoProfil')
        ]);
    }

    /**
     * Supprimer un utilisateur.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
            ], 403);
        }

        $ancien = $user->toArray();

        AuditLogService::log(
            auth()->user(),
            'Suppression',
            'users',
            $user->id,
            $ancien,
            null
        );

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.'
        ]);
    }
}
