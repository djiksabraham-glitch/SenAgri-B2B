<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "PhotoProfil",
    title: "PhotoProfil",
    description: "Modèle représentant la photo de profil d'un utilisateur",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "user_id",
            type: "integer",
            example: 5
        ),
        new OA\Property(
            property: "nom_fichier",
            type: "string",
            example: "profil.jpg"
        ),
        new OA\Property(
            property: "url",
            type: "string",
            format: "uri",
            example: "http://127.0.0.1:8000/storage/profils/profil.jpg"
        ),
        new OA\Property(
            property: "type_mime",
            type: "string",
            example: "image/jpeg"
        ),
        new OA\Property(
            property: "taille",
            type: "integer",
            example: 254780,
            description: "Taille du fichier en octets"
        ),
        new OA\Property(
            property: "created_at",
            type: "string",
            format: "date-time"
        ),
        new OA\Property(
            property: "updated_at",
            type: "string",
            format: "date-time"
        ),
        new OA\Property(
            property: "user",
            ref: "#/components/schemas/User"
        )
    ]
)]
class PhotoProfil extends Model
{
    protected $fillable = [
        'user_id',
        'nom_fichier',
        'url',
        'type_mime',
        'taille'
    ];

    /**
     * Utilisateur propriétaire de cette photo de profil.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}