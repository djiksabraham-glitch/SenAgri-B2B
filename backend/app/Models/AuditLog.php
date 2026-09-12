<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "AuditLog",
    title: "AuditLog",
    description: "Journal des actions effectuées par les utilisateurs",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "user_id",
            type: "integer",
            nullable: true,
            example: 5
        ),
        new OA\Property(
            property: "action",
            type: "string",
            example: "Création"
        ),
        new OA\Property(
            property: "table_concernee",
            type: "string",
            example: "offres"
        ),
        new OA\Property(
            property: "enregistrement_id",
            type: "integer",
            example: 12
        ),
        new OA\Property(
            property: "anciennes_valeurs",
            type: "object",
            nullable: true
        ),
        new OA\Property(
            property: "nouvelles_valeurs",
            type: "object",
            nullable: true
        ),
        new OA\Property(
            property: "date_action",
            type: "string",
            format: "date-time",
            example: "2026-08-02T15:30:00Z"
        ),
        new OA\Property(
            property: "user",
            ref: "#/components/schemas/User"
        )
    ]
)]
class AuditLog extends Model
{
    protected $fillable = [

        'user_id',

        'action',

        'table_concernee',

        'enregistrement_id',

        'anciennes_valeurs',

        'nouvelles_valeurs',

        'date_action',

    ];

    protected $casts = [

        'anciennes_valeurs' => 'array',

        'nouvelles_valeurs' => 'array',

        'date_action' => 'datetime',

    ];

    /**
     * Utilisateur ayant effectué l'action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}