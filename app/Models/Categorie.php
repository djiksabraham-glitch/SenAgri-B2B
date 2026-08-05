<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Categorie",
    title: "Categorie",
    description: "Modèle représentant une catégorie de produits",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "nom",
            type: "string",
            example: "Céréales"
        ),
        new OA\Property(
            property: "description",
            type: "string",
            example: "Catégorie regroupant les céréales"
        ),
        new OA\Property(
            property: "est_active",
            type: "boolean",
            example: true
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
        )
    ]
)]
class Categorie extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'est_active'
    ];

    /**
     * Une catégorie possède plusieurs offres.
     */
    public function offres(): HasMany
    {
        return $this->hasMany(Offre::class);
    }
}