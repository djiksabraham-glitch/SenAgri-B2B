<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Commande;
use App\Models\Message;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "User",
    title: "Utilisateur",
    description: "Modèle représentant un utilisateur de la plateforme SenAgri B2B",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            example: 1
        ),
        new OA\Property(
            property: "nom",
            type: "string",
            example: "Mamadou Diallo"
        ),
        new OA\Property(
            property: "email",
            type: "string",
            format: "email",
            example: "mamadou@gmail.com"
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
        ),
        new OA\Property(
            property: "role",
            type: "string",
            example: "vendeur"
        ),
        new OA\Property(
            property: "est_actif",
            type: "boolean",
            example: true
        ),
        new OA\Property(
            property: "cgu_acceptees_le",
            type: "string",
            format: "date-time",
            nullable: true
        ),
        new OA\Property(
            property: "email_verified_at",
            type: "string",
            format: "date-time",
            nullable: true
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
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'email',
        'password',
        'telephone',
        'adresse',
        'est_actif',
        'role',
        'cgu_acceptees_le',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'est_actif' => 'boolean',
            'cgu_acceptees_le' => 'datetime',
        ];
    }

    /**
     * Photo de profil de l'utilisateur.
     */
    public function photoProfil(): HasOne
    {
        return $this->hasOne(PhotoProfil::class);
    }

    /**
     * Offres publiées par l'utilisateur.
     */
    public function offres(): HasMany
    {
        return $this->hasMany(Offre::class);
    }

    /**
     * Commandes effectuées par l'utilisateur.
     */
    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

    /**
     * Relations pour les messages envoyés et reçus par l'utilisateur.
     */
    public function messagesEnvoyes()
{
    return $this->hasMany(Message::class,'expediteur_id');
}

public function messagesRecus()
{
    return $this->hasMany(Message::class,'destinataire_id');
}
}