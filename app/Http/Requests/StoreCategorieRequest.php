<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategorieRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à effectuer cette requête.
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
            'nom' => [
                'required',
                'string',
                'max:255',
                'unique:categories,nom',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'est_active' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Messages d'erreur personnalisés.
     */
    public function messages(): array
    {
        return [

            'nom.required' => 'Le nom de la catégorie est obligatoire.',

            'nom.string' => 'Le nom doit être une chaîne de caractères.',

            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères.',

            'nom.unique' => 'Cette catégorie existe déjà.',

            'description.string' => 'La description doit être une chaîne de caractères.',

            'description.max' => 'La description ne doit pas dépasser 1000 caractères.',

            'est_active.boolean' => 'Le champ est_active doit être vrai ou faux.',

        ];
    }
}