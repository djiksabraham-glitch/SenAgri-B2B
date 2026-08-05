<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageProduitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'chemin_fichier' => $this->chemin_fichier,

            'url' => asset('storage/'.$this->chemin_fichier),

            'ordre_affichage' => $this->ordre_affichage,

            'date_upload' => $this->date_upload,

        ];
    }
}