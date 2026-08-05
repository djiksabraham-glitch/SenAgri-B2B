<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'contenu' => $this->contenu,

            'lu' => $this->lu,

            'date_envoi' => $this->date_envoi,

            'expediteur' => [
                'id' => $this->expediteur->id,
                'nom' => $this->expediteur->nom,
            ],

            'destinataire' => [
                'id' => $this->destinataire->id,
                'nom' => $this->destinataire->nom,
            ],

            'offre' => $this->offre ? [

                'id' => $this->offre->id,

                'nom' => $this->offre->nom,

            ] : null,

        ];
    }
}