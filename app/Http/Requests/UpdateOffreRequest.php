<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOffreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'nom_produit' => 'sometimes|string|max:255',

            'description' => 'sometimes|string',

            'prix_unitaire' => 'sometimes|numeric|min:0',

            'quantite_disponible' => 'sometimes|integer|min:1',

            'unite' => 'sometimes|string|max:50',

            'est_disponible' => 'sometimes|boolean',

            'categorie_id' => 'sometimes|exists:categories,id',

        ];
    }
}