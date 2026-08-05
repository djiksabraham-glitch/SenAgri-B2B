<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Offre;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Dashboard",
    description: "Tableau de bord du vendeur"
)]
class DashboardController extends Controller
{
    #[OA\Get(
        path: "/dashboard",
        summary: "Afficher le tableau de bord du vendeur",
        description: "Retourne les statistiques du vendeur connecté ainsi que les cinq dernières commandes concernant ses offres.",
        tags: ["Dashboard"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Tableau de bord récupéré avec succès"
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    public function index()
    {
        $user = auth()->user();

        // Toutes les offres du vendeur
        $offres = Offre::where('user_id', $user->id);

        // Les commandes concernant les offres du vendeur
        $commandes = Commande::whereHas('offre', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });

        return response()->json([

            'vendeur' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'email' => $user->email,
            ],

            'statistiques' => [

                'nombre_offres' => $offres->count(),

                'offres_disponibles' => Offre::where('user_id', $user->id)
                    ->where('est_disponible', true)
                    ->count(),

                'nombre_commandes' => $commandes->count(),

                'quantite_vendue' => (int) $commandes->sum('quantite'),

                'chiffre_affaires' => (float) $commandes->sum('prix_total'),

            ],

            'dernieres_commandes' => Commande::with(['offre', 'acheteur'])
                ->whereHas('offre', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->latest()
                ->take(5)
                ->get(),

        ]);
    }
}