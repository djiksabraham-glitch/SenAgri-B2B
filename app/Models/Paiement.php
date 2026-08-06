<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Paiement",
    title: "Paiement",
    description: "Paiement effectué pour une commande",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "transaction_id",
            type: "string",
            nullable: true,
            example: "TRX-123456789"
        ),
        new OA\Property(
            property: "reference",
            type: "string",
            example: "PAY-20260805-0001"
        ),
        new OA\Property(
            property: "montant",
            type: "number",
            format: "float",
            example: 25000
        ),
        new OA\Property(
            property: "devise",
            type: "string",
            example: "XOF"
        ),
        new OA\Property(
            property: "methode",
            type: "string",
            nullable: true,
            example: "wave"
        ),
        new OA\Property(
            property: "statut",
            type: "string",
            example: "en_attente"
        ),
        new OA\Property(
            property: "date_paiement",
            type: "string",
            format: "date-time",
            nullable: true
        ),
        new OA\Property(
            property: "commande",
            ref: "#/components/schemas/Commande"
        )
    ]
)]
class Paiement extends Model
{
    protected $fillable = [

        'commande_id',

        'transaction_id',

        'reference',

        'montant',

        'devise',

        'methode',

        'statut',

        'date_paiement',

        'reponse_paydunya',

    ];

    protected $casts = [

        'montant' => 'decimal:2',

        'date_paiement' => 'datetime',

        'reponse_paydunya' => 'array',

    ];

    /**
     * Commande associée au paiement.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }
}