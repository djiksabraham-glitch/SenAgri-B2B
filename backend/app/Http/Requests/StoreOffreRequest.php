<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOffreRequest extends FormRequest
{
    /**
     * Déterminer si l'utilisateur est autorisé à effectuer cette requête.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
{
    return [

        'categorie_id' => 'required|exists:categories,id',

        'nom' => 'required|string|max:255',

        'description' => 'required|string|min:10',

        'prix_unitaire' => 'required|numeric|min:1',

        'quantite_disponible' => 'required|integer|min:1',

        'unite' => 'required|string|max:50',

        'est_disponible' => 'nullable|boolean',

    ];
}
    /**
     * Messages personnalisés.
     */
    public function messages(): array
    {
        return [

            'categorie_id.required' => 'La catégorie est obligatoire.',

            'categorie_id.exists' => 'La catégorie sélectionnée est invalide.',

            'nom.required' => 'Le nom du produit est obligatoire.',

            'nom.max' => 'Le nom du produit ne doit pas dépasser 255 caractères.',

            'description.required' => 'La description est obligatoire.',

            'description.min' => 'La description doit contenir au moins 10 caractères.',

            'prix_unitaire.required' => 'Le prix unitaire est obligatoire.',

            'prix_unitaire.numeric' => 'Le prix unitaire doit être un nombre.',

            'prix_unitaire.min' => 'Le prix unitaire doit être supérieur à 0.',

            'quantite_disponible.required' => 'La quantité disponible est obligatoire.',

            'quantite_disponible.integer' => 'La quantité disponible doit être un entier.',

            'quantite_disponible.min' => 'La quantité disponible doit être au moins égale à 1.',

            'unite.required' => 'L’unité est obligatoire.',

            'unite.max' => 'L’unité ne doit pas dépasser 50 caractères.',

            'est_disponible.boolean' => 'La disponibilité doit être vraie ou fausse.',

        ];
    }
}