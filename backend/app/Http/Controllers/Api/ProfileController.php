<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhotoProfilRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\PhotoProfilResource;
use App\Models\PhotoProfil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Profil",
    description: "Gestion du profil utilisateur"
)]
class ProfileController extends Controller
{
    #[OA\Get(
        path: "/profile",
        summary: "Afficher le profil connecté",
        description: "Retourne les informations du profil de l'utilisateur authentifié.",
        tags: ["Profil"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Profil récupéré avec succès"
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    public function me()
    {
        $user = auth()->user()->load('photoProfil');

        return response()->json([
            'message' => 'Profil récupéré avec succès.',
            'data' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'adresse' => $user->adresse,
                'role' => $user->role,
                'est_actif' => $user->est_actif,
                'cgu_acceptees_le' => $user->cgu_acceptees_le,
                'photo' => $user->photoProfil
                    ? new PhotoProfilResource($user->photoProfil)
                    : null,
            ]
        ]);
    }

    #[OA\Put(
        path: "/profile",
        summary: "Modifier le profil",
        description: "Met à jour les informations du profil de l'utilisateur connecté.",
        tags: ["Profil"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "nom",
                    type: "string",
                    example: "Mamadou Diallo"
                ),
                new OA\Property(
                    property: "telephone",
                    type: "string",
                    example: "771234567"
                ),
                new OA\Property(
                    property: "adresse",
                    type: "string",
                    example: "Dakar"
                )
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Profil mis à jour avec succès"
    )]
    #[OA\Response(
        response: 422,
        description: "Données invalides"
    )]
    public function update(UpdateProfileRequest $request)
    {
        $user = auth()->user();

        $user->update($request->validated());

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'data' => $user->fresh()
        ]);
    }

    #[OA\Post(
        path: "/profile/photo",
        summary: "Ajouter ou remplacer la photo de profil",
        description: "Téléverse une nouvelle photo de profil. Si une photo existe déjà, elle est remplacée.",
        tags: ["Profil"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: "multipart/form-data",
            schema: new OA\Schema(
                required: ["photo"],
                properties: [
                    new OA\Property(
                        property: "photo",
                        type: "string",
                        format: "binary",
                        description: "Fichier image"
                    )
                ]
            )
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Photo enregistrée avec succès"
    )]
    #[OA\Response(
        response: 422,
        description: "Fichier invalide"
    )]
    public function uploadPhoto(StorePhotoProfilRequest $request)
    {
        $user = auth()->user();

        // Supprimer l'ancienne photo
        if ($user->photoProfil) {

            Storage::disk('public')->delete($user->photoProfil->url);

            $user->photoProfil->delete();
        }

        $file = $request->file('photo');

        $path = $file->store('profils', 'public');

        $photo = PhotoProfil::create([

            'user_id' => $user->id,

            'nom_fichier' => $file->getClientOriginalName(),

            'url' => $path,

            'type_mime' => $file->getMimeType(),

            'taille' => $file->getSize(),

        ]);

        return response()->json([

            'message' => 'Photo de profil enregistrée avec succès.',

            'data' => new PhotoProfilResource($photo)

        ], 201);
    }

    #[OA\Delete(
        path: "/profile/photo",
        summary: "Supprimer la photo de profil",
        description: "Supprime la photo de profil de l'utilisateur connecté.",
        tags: ["Profil"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Photo supprimée avec succès"
    )]
    #[OA\Response(
        response: 404,
        description: "Aucune photo de profil"
    )]
    public function destroyPhoto()
    {
        $user = auth()->user();

        if (!$user->photoProfil) {

            return response()->json([
                'message' => 'Aucune photo de profil.'
            ], 404);

        }

        Storage::disk('public')->delete($user->photoProfil->url);

        $user->photoProfil->delete();

        return response()->json([
            'message' => 'Photo supprimée avec succès.'
        ]);
    }

    #[OA\Delete(
        path: "/profil/account",
        summary: "Supprimer le compte utilisateur",
        description: "Supprime définitivement le compte de l'utilisateur connecté, ainsi que toutes ses données personnelles conformément à la Loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel.",
        tags: ["Profil"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Compte supprimé avec succès"
    )]
    public function deleteAccount(Request $request)
    {
        $user = auth()->user();

        // Supprimer la photo de profil si elle existe
        if ($user->photoProfil) {
            Storage::disk('public')->delete($user->photoProfil->url);
            $user->photoProfil->delete();
        }

        // Révoquer tous les tokens d'accès
        $user->tokens()->delete();

        // Supprimer le compte utilisateur (cascade sur offres, commandes, messages, etc.)
        $user->delete();

        return response()->json([
            'message' => 'Votre compte et toutes vos données personnelles ont été supprimés avec succès.'
        ]);
    }
}