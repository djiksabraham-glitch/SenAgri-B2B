<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommandeRequest;
use App\Http\Requests\UpdateCommandeRequest;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Models\Offre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\AuditLogService;
use App\Notifications\NouvelleCommandeNotification;
use OpenApi\Attributes as OA;
use Barryvdh\DomPDF\Facade\Pdf;


#[OA\Tag(
    name: "Commandes",
    description: "Gestion des commandes"
)]
class CommandeController extends Controller
{
    #[OA\Get(
        path: "/commandes",
        summary: "Lister les commandes",
        tags: ["Commandes"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des commandes"
    )]
    public function index()
    {
        $commandes = Commande::with([
            'offre',
            'offre.vendeur',
            'acheteur'
        ])->latest()->paginate(10);

        return CommandeResource::collection($commandes);
    }

    #[OA\Post(
        path: "/commandes",
        summary: "Créer une commande",
        tags: ["Commandes"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["offre_id", "quantite"],
            properties: [
                new OA\Property(
                    property: "offre_id",
                    type: "integer",
                    example: 1
                ),
                new OA\Property(
                    property: "quantite",
                    type: "integer",
                    example: 5
                )
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Commande créée avec succès"
    )]
    #[OA\Response(
        response: 403,
        description: "Impossible de commander sa propre offre"
    )]
    #[OA\Response(
        response: 422,
        description: "Offre indisponible ou stock insuffisant"
    )]
    #[OA\Response(
        response: 500,
        description: "Erreur serveur"
    )]
    public function store(StoreCommandeRequest $request)
    {
        $offre = Offre::with('vendeur')->findOrFail($request->offre_id);

        if ($offre->user_id == auth()->id()) {

            return response()->json([
                'message' => 'Vous ne pouvez pas commander votre propre offre.'
            ], 403);

        }

        if (!$offre->est_disponible) {

            return response()->json([
                'message' => 'Cette offre n’est plus disponible.'
            ], 422);

        }

        if ($request->quantite > $offre->quantite_disponible) {

            return response()->json([
                'message' => 'Stock insuffisant.'
            ], 422);

        }

        DB::beginTransaction();

        try {

            $commande = Commande::create([

                'offre_id' => $offre->id,

                'user_id' => auth()->id(),

                'quantite' => $request->quantite,

                'prix_total' => $offre->prix_unitaire * $request->quantite,

                'statut' => 'en_attente',

                'date_commande' => now(),

            ]);

            $vendeur = $offre->vendeur;

            if ($vendeur) {
                $vendeur->notify(new NouvelleCommandeNotification($commande));
            }

            AuditLogService::log(

                auth()->user(),

                'Création',

                'commandes',

                $commande->id,

                null,

                $commande->toArray()

            );

            $offre->quantite_disponible -= $request->quantite;

            if ($offre->quantite_disponible <= 0) {

                $offre->quantite_disponible = 0;

                $offre->est_disponible = false;

            }

            $offre->save();

            DB::commit();

            $commande->load([
                'offre',
                'offre.vendeur',
                'acheteur'
            ]);

            return response()->json([

    'message' => 'Commande créée avec succès.',

    'data' => new CommandeResource($commande),

    'facture' => route('commandes.facture', $commande->id)

], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Erreur lors de la création de la commande.',
                'error' => $e->getMessage()
            ], 500);

        }
    }

    #[OA\Get(
        path: "/commandes/{id}",
        summary: "Afficher une commande",
        tags: ["Commandes"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de la commande",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Commande trouvée"
    )]
    #[OA\Response(
        response: 404,
        description: "Commande introuvable"
    )]
    public function show(Commande $commande)
    {
        $commande->load([
            'offre',
            'offre.vendeur',
            'acheteur'
        ]);

        return new CommandeResource($commande);
    }

    #[OA\Put(
        path: "/commandes/{id}",
        summary: "Modifier le statut d'une commande",
        tags: ["Commandes"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de la commande",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["statut"],
            properties: [
                new OA\Property(
                    property: "statut",
                    type: "string",
                    example: "confirmee"
                )
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Commande mise à jour"
    )]
    #[OA\Response(
        response: 404,
        description: "Commande introuvable"
    )]
    public function update(UpdateCommandeRequest $request, Commande $commande)
    {
        $ancien = $commande->toArray();

        $commande->update([

            'statut' => $request->statut

        ]);

        $commande->load([
            'offre',
            'offre.vendeur',
            'acheteur'
        ]);

        AuditLogService::log(

            auth()->user(),

            'Modification',

            'commandes',

            $commande->id,

            $ancien,

            $commande->fresh()->toArray()

        );

        return response()->json([

            'message' => 'Commande mise à jour avec succès.',

            'data' => new CommandeResource($commande)

        ]);
    }

    #[OA\Delete(
        path: "/commandes/{id}",
        summary: "Supprimer une commande",
        tags: ["Commandes"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de la commande",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Commande supprimée"
    )]
    #[OA\Response(
        response: 404,
        description: "Commande introuvable"
    )]
    public function destroy(Commande $commande)
    {
        $ancien = $commande->toArray();

        AuditLogService::log(

            auth()->user(),

            'Suppression',

            'commandes',

            $commande->id,

            $ancien,

            null

        );

        $commande->delete();

        return response()->json([

            'message' => 'Commande supprimée avec succès.'

        ]);
    }


    /**
 * Télécharger la facture PDF d'une commande.
 */
public function facture(Commande $commande)
{
    $commande->load([
        'offre',
        'offre.vendeur',
        'acheteur'
    ]);

    $pdf = Pdf::loadView('factures.facture', [
        'commande' => $commande
    ]);

    return $pdf->download('facture_commande_'.$commande->id.'.pdf');
}
}

