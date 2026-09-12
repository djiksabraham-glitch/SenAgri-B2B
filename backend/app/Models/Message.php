<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OpenApi\Attributes as OA;

use Illuminate\Database\Eloquent\Factories\HasFactory;

#[OA\Schema(
    schema: "Message",
    title: "Message",
    properties: [
        new OA\Property(property: "id", type: "integer"),
        new OA\Property(property: "contenu", type: "string"),
        new OA\Property(property: "lu", type: "boolean"),
        new OA\Property(property: "date_envoi", type: "string", format: "date-time"),
        new OA\Property(property: "expediteur", ref: "#/components/schemas/User"),
        new OA\Property(property: "destinataire", ref: "#/components/schemas/User"),
        new OA\Property(property: "offre", ref: "#/components/schemas/Offre")
    ]
)]
class Message extends Model
{
    use HasFactory;
    protected $fillable = [

        'expediteur_id',

        'destinataire_id',

        'offre_id',

        'contenu',

        'lu',

        'date_envoi',

    ];

    protected $casts = [

        'lu' => 'boolean',

        'date_envoi' => 'datetime',

    ];

    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(User::class,'expediteur_id');
    }

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class,'destinataire_id');
    }

    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class);
    }
}