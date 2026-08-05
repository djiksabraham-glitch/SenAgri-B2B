<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategorieResource;
use App\Models\Categorie;
use App\Http\Requests\StoreCategorieRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\UpdateCategorieRequest;
use App\Services\AuditLogService;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Catégories",
    description: "Gestion des catégories de produits"
)]
class CategorieController extends Controller
{
    /**
     * Afficher la liste des catégories.
     */
    #[OA\Get(
        path: "/categories",
        operationId: "listeCategories",
        summary: "Lister les catégories",
        description: "Retourne la liste de toutes les catégories disponibles.",
        tags: ["Catégories"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste récupérée avec succès."
            )
        ]
    )]
    public function index()
    {
        $categories = Categorie::orderBy('nom')->get();

        return CategorieResource::collection($categories);
    }

    /**
     * Enregistrer une nouvelle catégorie.
     */
    #[OA\Post(
        path: "/categories",
        operationId: "creerCategorie",
        summary: "Créer une catégorie",
        description: "Permet de créer une nouvelle catégorie.",
        tags: ["Catégories"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nom"],
                properties: [
                    new OA\Property(
                        property: "nom",
                        type: "string",
                        example: "Fruits"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Catégorie créée avec succès."
            ),
            new OA\Response(
                response: 422,
                description: "Erreur de validation."
            )
        ]
    )]
    public function store(StoreCategorieRequest $request): JsonResponse
    {
        $categorie = Categorie::create(
            $request->validated()
        );

        AuditLogService::log(
            auth()->user(),
            'Création',
            'categories',
            $categorie->id,
            null,
            $categorie->toArray()
        );

        return response()->json([
            'message' => 'Catégorie créée avec succès.',
            'data' => new CategorieResource($categorie)
        ], 201);
    }

    /**
     * Afficher une catégorie.
     */
    #[OA\Get(
        path: "/categories/{id}",
        operationId: "detailCategorie",
        summary: "Afficher une catégorie",
        description: "Retourne les informations d'une catégorie.",
        tags: ["Catégories"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "Identifiant de la catégorie",
                schema: new OA\Schema(
                    type: "integer",
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Catégorie trouvée."
            ),
            new OA\Response(
                response: 404,
                description: "Catégorie introuvable."
            )
        ]
    )]
    public function show(Categorie $categorie)
    {
        return new CategorieResource($categorie);
    }

    /**
     * Modifier une catégorie.
     */
    #[OA\Put(
        path: "/categories/{id}",
        operationId: "modifierCategorie",
        summary: "Modifier une catégorie",
        description: "Met à jour une catégorie existante.",
        tags: ["Catégories"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "Identifiant de la catégorie",
                schema: new OA\Schema(
                    type: "integer",
                    example: 1
                )
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "nom",
                        type: "string",
                        example: "Légumes"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Catégorie modifiée."
            ),
            new OA\Response(
                response: 404,
                description: "Catégorie introuvable."
            ),
            new OA\Response(
                response: 422,
                description: "Erreur de validation."
            )
        ]
    )]
    public function update(UpdateCategorieRequest $request, Categorie $categorie): JsonResponse
    {
        $ancien = $categorie->toArray();

        $categorie->update($request->validated());

        AuditLogService::log(
            auth()->user(),
            'Modification',
            'categories',
            $categorie->id,
            $ancien,
            $categorie->fresh()->toArray()
        );

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès.',
            'data' => new CategorieResource($categorie->fresh())
        ]);
    }

    /**
     * Supprimer une catégorie.
     */
    #[OA\Delete(
        path: "/categories/{id}",
        operationId: "supprimerCategorie",
        summary: "Supprimer une catégorie",
        description: "Supprime une catégorie si elle ne possède aucune offre.",
        tags: ["Catégories"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "Identifiant de la catégorie",
                schema: new OA\Schema(
                    type: "integer",
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Catégorie supprimée."
            ),
            new OA\Response(
                response: 404,
                description: "Catégorie introuvable."
            ),
            new OA\Response(
                response: 409,
                description: "La catégorie contient encore des offres."
            )
        ]
    )]
    public function destroy(Categorie $categorie): JsonResponse
    {
        if ($categorie->offres()->exists()) {

            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient encore des offres.'
            ], 409);
        }

        $ancien = $categorie->toArray();

        AuditLogService::log(
            auth()->user(),
            'Suppression',
            'categories',
            $categorie->id,
            $ancien,
            null
        );

        $categorie->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès.'
        ]);
    }
}