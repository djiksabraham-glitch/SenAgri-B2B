<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'offre_id' => [
                'required',
                'exists:offres,id'
            ],

            'quantite' => [
                'required',
                'integer',
                'min:1'
            ],

        ];
    }

    public function messages(): array
    {
        return [

            'offre_id.required' => 'Veuillez sélectionner une offre.',

            'offre_id.exists' => 'Cette offre n’existe pas.',

            'quantite.required' => 'La quantité est obligatoire.',

            'quantite.integer' => 'La quantité doit être un entier.',

            'quantite.min' => 'La quantité doit être supérieure à zéro.',

        ];
    }
}