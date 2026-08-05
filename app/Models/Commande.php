<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Commande",
    title: "Commande",
    description: "Modèle représentant une commande passée par un acheteur",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "offre_id",
            type: "integer",
            example: 12
        ),
        new OA\Property(
            property: "user_id",
            type: "integer",
            example: 5
        ),
        new OA\Property(
            property: "quantite",
            type: "integer",
            example: 20
        ),
        new OA\Property(
            property: "prix_total",
            type: "number",
            format: "float",
            example: 15000
        ),
        new OA\Property(
            property: "statut",
            type: "string",
            example: "en_attente"
        ),
        new OA\Property(
            property: "date_commande",
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
        ),
        new OA\Property(
            property: "acheteur",
            ref: "#/components/schemas/User"
        )
    ]
)]
class Commande extends Model
{
    protected $fillable = [

        'offre_id',

        'user_id',

        'quantite',

        'prix_total',

        'statut',

        'date_commande',

    ];

    protected $casts = [

        'prix_total' => 'decimal:2',

        'date_commande' => 'datetime',

    ];

    /**
     * Offre commandée.
     */
    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class);
    }

    /**
     * Acheteur.
     */
    public function acheteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Vendeur de l'offre commandée.
     */
    public function vendeur(): BelongsTo
    {
        return $this->offre->vendeur();
    }
}