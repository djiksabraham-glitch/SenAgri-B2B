<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'adresse' => $this->adresse,
            'role' => $this->role,
            'est_actif' => $this->est_actif,
            'cgu_acceptees_le' => $this->cgu_acceptees_le,
            'created_at' => $this->created_at,
        ];
    }
}