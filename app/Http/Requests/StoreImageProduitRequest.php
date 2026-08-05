<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreImageProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ],

            'ordre_affichage' => [
                'required',
                'integer',
                'min:1',
                'max:3'
            ]

        ];
    }

    public function messages(): array
    {
        return [

            'image.required' => 'Veuillez sélectionner une image.',

            'image.image' => 'Le fichier doit être une image.',

            'image.mimes' => 'Formats autorisés : jpg, jpeg, png, webp.',

            'image.max' => 'La taille maximale est de 2 Mo.',

            'ordre_affichage.required' => 'L’ordre d’affichage est obligatoire.',

            'ordre_affichage.max' => 'L’ordre doit être compris entre 1 et 3.',

        ];
    }
}