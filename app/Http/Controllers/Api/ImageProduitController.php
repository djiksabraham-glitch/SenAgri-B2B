<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreImageProduitRequest;
use App\Http\Resources\ImageProduitResource;
use App\Models\ImageProduit;
use App\Models\Offre;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Images Produits",
    description: "Gestion des images des offres"
)]
class ImageProduitController extends Controller
{
    #[OA\Post(
        path: "/offres/{offre}/images",
        summary: "Ajouter une image à une offre",
        description: "Permet d'ajouter une image à une offre. Une offre ne peut contenir que trois images.",
        tags: ["Images Produits"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "offre",
        in: "path",
        required: true,
        description: "Identifiant de l'offre",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: "multipart/form-data",
            schema: new OA\Schema(
                required: ["image", "ordre_affichage"],
                properties: [
                    new OA\Property(
                        property: "image",
                        type: "string",
                        format: "binary",
                        description: "Image à envoyer"
                    ),
                    new OA\Property(
                        property: "ordre_affichage",
                        type: "integer",
                        example: 1,
                        description: "Ordre d'affichage de l'image"
                    )
                ]
            )
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Image ajoutée avec succès"
    )]
    #[OA\Response(
        response: 422,
        description: "Limite de trois images atteinte ou données invalides"
    )]
    #[OA\Response(
        response: 404,
        description: "Offre introuvable"
    )]
    public function store(StoreImageProduitRequest $request, Offre $offre)
    {
        // Une offre ne peut avoir que 3 images
        if ($offre->images()->count() >= 3) {

            return response()->json([
                'message' => 'Une offre ne peut contenir que 3 images.'
            ], 422);

        }

        $path = $request->file('image')->store('offres', 'public');

        $image = $offre->images()->create([

            'chemin_fichier' => $path,

            'ordre_affichage' => $request->ordre_affichage,

            'date_upload' => now(),

        ]);

        return response()->json([

            'message' => 'Image ajoutée avec succès.',

            'data' => new ImageProduitResource($image)

        ], 201);
    }

    #[OA\Delete(
        path: "/images-produits/{id}",
        summary: "Supprimer une image",
        description: "Supprime une image d'une offre ainsi que son fichier sur le serveur.",
        tags: ["Images Produits"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de l'image",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Image supprimée avec succès"
    )]
    #[OA\Response(
        response: 404,
        description: "Image introuvable"
    )]
    public function destroy(ImageProduit $imageProduit)
    {
        Storage::disk('public')->delete($imageProduit->chemin_fichier);

        $imageProduit->delete();

        return response()->json([

            'message' => 'Image supprimée avec succès.'

        ]);
    }
}