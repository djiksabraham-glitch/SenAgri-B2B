<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

use Illuminate\Database\Eloquent\Factories\HasFactory;

#[OA\Schema(
    schema: "ImageProduit",
    title: "ImageProduit",
    description: "Modèle représentant une image associée à une offre",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "offre_id",
            type: "integer",
            example: 10
        ),
        new OA\Property(
            property: "chemin_fichier",
            type: "string",
            example: "offres/riz_01.jpg"
        ),
        new OA\Property(
            property: "url",
            type: "string",
            format: "uri",
            example: "http://127.0.0.1:8000/storage/offres/riz_01.jpg"
        ),
        new OA\Property(
            property: "ordre_affichage",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "date_upload",
            type: "string",
            format: "date-time",
            example: "2026-08-02T14:30:00Z"
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
            property: "offre",
            ref: "#/components/schemas/Offre"
        )
    ]
)]
class ImageProduit extends Model
{
    use HasFactory;
    protected $fillable = [
        'offre_id',
        'chemin_fichier',
        'ordre_affichage',
        'date_upload',
    ];

    protected $casts = [
        'date_upload' => 'datetime',
    ];

    /**
     * Offre à laquelle appartient l'image.
     */
    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class);
    }

    /**
     * URL complète de l'image.
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->chemin_fichier);
    }
}