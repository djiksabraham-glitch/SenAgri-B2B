<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'quantite' => $this->quantite,

            'prix_total' => $this->prix_total,

            'statut' => $this->statut,

            'est_payee' => $this->statut === 'payee' || ($this->paiement && $this->paiement->statut === 'reussi'),

            'date_commande' => $this->date_commande,

            'created_at' => $this->created_at,

            'paiement' => $this->paiement ? [
                'id' => $this->paiement->id,
                'statut' => $this->paiement->statut,
                'transaction_id' => $this->paiement->transaction_id,
                'methode' => $this->paiement->methode,
            ] : null,

            'offre' => [

                'id' => $this->offre->id,

                'nom' => $this->offre->nom,

                'prix_unitaire' => $this->offre->prix_unitaire,

                'unite' => $this->offre->unite,

            ],

            'acheteur' => [

                'id' => $this->acheteur->id,

                'nom' => $this->acheteur->nom,

                'email' => $this->acheteur->email,

                'telephone' => $this->acheteur->telephone,

            ],

            'vendeur' => [

                'id' => $this->offre->vendeur->id,

                'nom' => $this->offre->vendeur->nom,

                'email' => $this->offre->vendeur->email,

                'telephone' => $this->offre->vendeur->telephone,

            ],

        ];
    }
}