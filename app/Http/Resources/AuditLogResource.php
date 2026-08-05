<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'action' => $this->action,

            'table_concernee' => $this->table_concernee,

            'enregistrement_id' => $this->enregistrement_id,

            'date_action' => $this->date_action,

            'utilisateur' => $this->user ? [

                'id' => $this->user->id,

                'nom' => $this->user->nom,

                'email' => $this->user->email,

            ] : null,

            'anciennes_valeurs' => $this->anciennes_valeurs,

            'nouvelles_valeurs' => $this->nouvelles_valeurs,

        ];
    }
}