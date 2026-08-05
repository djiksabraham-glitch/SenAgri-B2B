<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'nom' => $this->nom,

            'description' => $this->description,

            'prix_unitaire' => $this->prix_unitaire,

            'quantite_disponible' => $this->quantite_disponible,

            'unite' => $this->unite,

            'est_disponible' => $this->est_disponible,

            'date_publication' => $this->date_publication,

            'created_at' => $this->created_at,

            'updated_at' => $this->updated_at,

            /*
            |--------------------------------------------------------------------------
            | Catégorie
            |--------------------------------------------------------------------------
            */

            'categorie' => $this->whenLoaded('categorie', function () {

                return [

                    'id' => $this->categorie->id,

                    'nom' => $this->categorie->nom,

                    'description' => $this->categorie->description,

                ];

            }),

            /*
            |--------------------------------------------------------------------------
            | Vendeur
            |--------------------------------------------------------------------------
            */

            'vendeur' => $this->whenLoaded('vendeur', function () {

                return [

                    'id' => $this->vendeur->id,

                    'nom' => $this->vendeur->nom,

                    'email' => $this->vendeur->email,

                    'telephone' => $this->vendeur->telephone,

                    'adresse' => $this->vendeur->adresse,

                ];

            }),

            /*
            |--------------------------------------------------------------------------
            | Images
            |--------------------------------------------------------------------------
            */

            'images' => $this->whenLoaded('images', function () {

                return $this->images->map(function ($image) {

                    return [

                        'id' => $image->id,

                        'chemin_fichier' => $image->chemin_fichier,

                        'ordre_affichage' => $image->ordre_affichage,

                        'date_upload' => $image->date_upload,

                    ];

                });

            }),

        ];
    }
}