<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Offre;
use App\Models\User;
use App\Models\Categorie;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Statistiques",
    description: "Statistiques générales de la plateforme SenAgri B2B"
)]
class StatistiqueController extends Controller
{
    #[OA\Get(
        path: "/statistiques",
        summary: "Statistiques générales",
        description: "Retourne les principales statistiques de la plateforme SenAgri B2B.",
        tags: ["Statistiques"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Statistiques récupérées avec succès",
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "utilisateurs",
                    type: "integer",
                    example: 25
                ),
                new OA\Property(
                    property: "vendeurs",
                    type: "integer",
                    example: 8
                ),
                new OA\Property(
                    property: "offres",
                    type: "integer",
                    example: 56
                ),
                new OA\Property(
                    property: "offres_disponibles",
                    type: "integer",
                    example: 40
                ),
                new OA\Property(
                    property: "categories",
                    type: "integer",
                    example: 6
                ),
                new OA\Property(
                    property: "commandes",
                    type: "integer",
                    example: 72
                ),
                new OA\Property(
                    property: "chiffre_affaires",
                    type: "number",
                    format: "float",
                    example: 985000
                ),
                new OA\Property(
                    property: "quantite_vendue",
                    type: "integer",
                    example: 350
                ),
                new OA\Property(
                    property: "produits_plus_vendus",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(
                                property: "offre_id",
                                type: "integer",
                                example: 3
                            ),
                            new OA\Property(
                                property: "total_vendu",
                                type: "integer",
                                example: 95
                            ),
                            new OA\Property(
                                property: "offre",
                                ref: "#/components/schemas/Offre"
                            )
                        ]
                    )
                ),
                new OA\Property(
                    property: "ventes_par_mois",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(
                                property: "mois",
                                type: "integer",
                                example: 7
                            ),
                            new OA\Property(
                                property: "chiffre_affaires",
                                type: "number",
                                format: "float",
                                example: 250000
                            )
                        ]
                    )
                )
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    /**
     * Statistiques générales de la plateforme.
     */
    public function index()
    {
        return response()->json([

            'utilisateurs' => User::count(),

            'vendeurs' => Offre::distinct('user_id')->count(),

            'offres' => Offre::count(),

            'offres_disponibles' => Offre::where('est_disponible', true)->count(),

            'categories' => Categorie::count(),

            'commandes' => Commande::count(),

            'chiffre_affaires' => Commande::sum('prix_total'),

            'quantite_vendue' => Commande::sum('quantite'),

            'produits_plus_vendus' => Commande::select(
                    'offre_id',
                    DB::raw('SUM(quantite) as total_vendu')
                )
                ->with('offre')
                ->groupBy('offre_id')
                ->orderByDesc('total_vendu')
                ->take(5)
                ->get(),

            'ventes_par_mois' => (function() {
                $driver = DB::connection()->getDriverName();
                $monthExpr = $driver === 'sqlite' ? "strftime('%m', date_commande)" : "MONTH(date_commande)";
                return Commande::select(
                    DB::raw("{$monthExpr} as mois"),
                    DB::raw('SUM(prix_total) as chiffre_affaires')
                )
                ->groupBy(DB::raw($monthExpr))
                ->orderBy(DB::raw($monthExpr))
                ->get();
            })(),

        ]);
    }
}