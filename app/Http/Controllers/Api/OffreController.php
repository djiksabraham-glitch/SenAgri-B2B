<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOffreRequest;
use App\Http\Requests\UpdateOffreRequest;
use App\Http\Resources\OffreResource;
use App\Models\Offre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\AuditLogService;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Offres",
    description: "Gestion des offres de produits agricoles"
)]
class OffreController extends Controller
{
    #[OA\Get(
        path: "/offres",
        summary: "Lister les offres",
        tags: ["Offres"]
    )]
    #[OA\Parameter(
        name: "nom",
        in: "query",
        required: false,
        description: "Recherche par nom",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Parameter(
        name: "categorie_id",
        in: "query",
        required: false,
        description: "Filtrer par catégorie",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Parameter(
        name: "prix_min",
        in: "query",
        required: false,
        description: "Prix minimum",
        schema: new OA\Schema(type: "number", format: "float")
    )]
    #[OA\Parameter(
        name: "prix_max",
        in: "query",
        required: false,
        description: "Prix maximum",
        schema: new OA\Schema(type: "number", format: "float")
    )]
    #[OA\Parameter(
        name: "disponible",
        in: "query",
        required: false,
        description: "Disponibilité",
        schema: new OA\Schema(type: "boolean")
    )]
    #[OA\Parameter(
        name: "tri",
        in: "query",
        required: false,
        description: "Tri (prix_asc, prix_desc, ancien, nom)",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des offres"
    )]
    public function index(Request $request)
    {
        $query = Offre::with(['categorie', 'vendeur', 'images']);

        if ($request->filled('nom')) {
            $query->where('nom', 'like', '%' . $request->nom . '%');
        }

        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->filled('prix_min')) {
            $query->where('prix_unitaire', '>=', $request->prix_min);
        }

        if ($request->filled('prix_max')) {
            $query->where('prix_unitaire', '<=', $request->prix_max);
        }

        if ($request->filled('disponible')) {
            $query->where('est_disponible', $request->disponible);
        }

        switch ($request->get('tri')) {

            case 'prix_asc':
                $query->orderBy('prix_unitaire');
                break;

            case 'prix_desc':
                $query->orderByDesc('prix_unitaire');
                break;

            case 'ancien':
                $query->oldest();
                break;

            case 'nom':
                $query->orderBy('nom');
                break;

            default:
                $query->latest();
        }

        $offres = $query->paginate(10);

        return OffreResource::collection($offres);
    }

    #[OA\Post(
        path: "/offres",
        summary: "Créer une offre",
        tags: ["Offres"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: [
                "categorie_id",
                "nom",
                "description",
                "prix_unitaire",
                "quantite_disponible",
                "unite"
            ],
            properties: [
                new OA\Property(property: "categorie_id", type: "integer"),
                new OA\Property(property: "nom", type: "string"),
                new OA\Property(property: "description", type: "string"),
                new OA\Property(property: "prix_unitaire", type: "number", format: "float"),
                new OA\Property(property: "quantite_disponible", type: "integer"),
                new OA\Property(property: "unite", type: "string"),
                new OA\Property(property: "est_disponible", type: "boolean")
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Offre créée avec succès"
    )]
    public function store(StoreOffreRequest $request): JsonResponse
    {
        $offre = Offre::create([

            'user_id' => auth()->id(),
            'categorie_id' => $request->categorie_id,
            'nom' => $request->nom,
            'description' => $request->description,
            'prix_unitaire' => $request->prix_unitaire,
            'quantite_disponible' => $request->quantite_disponible,
            'unite' => $request->unite,
            'est_disponible' => $request->boolean('est_disponible', true),
            'date_publication' => now(),

        ]);

        AuditLogService::log(
            auth()->user(),
            'Création',
            'offres',
            $offre->id,
            null,
            $offre->toArray()
        );

        return response()->json([
            'message' => 'Offre créée avec succès.',
            'data' => new OffreResource(
                $offre->load(['vendeur', 'categorie', 'images'])
            )
        ], 201);
    }

    #[OA\Get(
        path: "/offres/{id}",
        summary: "Afficher une offre",
        tags: ["Offres"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Détail d'une offre"
    )]
    #[OA\Response(
        response: 404,
        description: "Offre introuvable"
    )]
    public function show($id)
    {
        $offre = Offre::with(['vendeur', 'categorie', 'images'])
            ->find($id);

        if (!$offre) {

            return response()->json([
                'message' => 'Offre introuvable.'
            ], 404);

        }

        return new OffreResource($offre);
    }

    #[OA\Put(
        path: "/offres/{id}",
        summary: "Modifier une offre",
        tags: ["Offres"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "categorie_id", type: "integer"),
                new OA\Property(property: "nom", type: "string"),
                new OA\Property(property: "description", type: "string"),
                new OA\Property(property: "prix_unitaire", type: "number", format: "float"),
                new OA\Property(property: "quantite_disponible", type: "integer"),
                new OA\Property(property: "unite", type: "string"),
                new OA\Property(property: "est_disponible", type: "boolean")
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Offre mise à jour"
    )]
    #[OA\Response(
        response: 404,
        description: "Offre introuvable"
    )]
    public function update(UpdateOffreRequest $request, $id)
    {
        $offre = Offre::find($id);

        if (!$offre) {

            return response()->json([
                'message' => 'Offre introuvable.'
            ], 404);

        }

        $ancien = $offre->toArray();

        $offre->update($request->validated());

        AuditLogService::log(
            auth()->user(),
            'Modification',
            'offres',
            $offre->id,
            $ancien,
            $offre->fresh()->toArray()
        );

        return response()->json([
            'message' => 'Offre mise à jour avec succès.',
            'data' => new OffreResource(
                $offre->load(['vendeur', 'categorie', 'images'])
            )
        ]);
    }

    #[OA\Delete(
        path: "/offres/{id}",
        summary: "Supprimer une offre",
        tags: ["Offres"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Offre supprimée"
    )]
    #[OA\Response(
        response: 404,
        description: "Offre introuvable"
    )]
    public function destroy($id)
    {
        $offre = Offre::find($id);

        if (!$offre) {

            return response()->json([
                'message' => 'Offre introuvable.'
            ], 404);

        }

        $ancien = $offre->toArray();

        AuditLogService::log(
            auth()->user(),
            'Suppression',
            'offres',
            $offre->id,
            $ancien,
            null
        );

        $offre->delete();

        return response()->json([
            'message' => 'Offre supprimée avec succès.'
        ]);
    }
}