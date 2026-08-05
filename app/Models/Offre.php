<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Offre",
    title: "Offre",
    description: "Modèle représentant une offre publiée par un vendeur",
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
            property: "categorie_id",
            type: "integer",
            example: 2
        ),
        new OA\Property(
            property: "nom",
            type: "string",
            example: "Riz parfumé"
        ),
        new OA\Property(
            property: "description",
            type: "string",
            example: "Sac de riz parfumé de 50 kg"
        ),
        new OA\Property(
            property: "prix_unitaire",
            type: "number",
            format: "float",
            example: 18000
        ),
        new OA\Property(
            property: "quantite_disponible",
            type: "integer",
            example: 100
        ),
        new OA\Property(
            property: "unite",
            type: "string",
            example: "Sac"
        ),
        new OA\Property(
            property: "est_disponible",
            type: "boolean",
            example: true
        ),
        new OA\Property(
            property: "date_publication",
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
            property: "vendeur",
            ref: "#/components/schemas/User"
        ),
        new OA\Property(
            property: "categorie",
            ref: "#/components/schemas/Categorie"
        ),
        new OA\Property(
            property: "images",
            type: "array",
            items: new OA\Items(ref: "#/components/schemas/ImageProduit")
        )
    ]
)]
class Offre extends Model
{
    protected $fillable = [
        'user_id',
        'categorie_id',
        'nom',
        'description',
        'prix_unitaire',
        'quantite_disponible',
        'unite',
        'est_disponible',
        'date_publication',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'est_disponible' => 'boolean',
        'date_publication' => 'datetime',
    ];

    /**
     * Vendeur ayant publié l'offre.
     */
    public function vendeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Catégorie de l'offre.
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * Images associées à l'offre.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ImageProduit::class);
    }

    /**
     * Commandes de cette offre.
     */
    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }
    /**
     * Messages associés à l'offre.
     */
    public function messages()
{
    return $this->hasMany(Message::class);
}

}