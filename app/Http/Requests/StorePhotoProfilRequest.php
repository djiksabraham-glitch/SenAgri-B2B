<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhotoProfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'photo' => [

                'required',

                'image',

                'mimes:jpg,jpeg,png,webp',

                'max:2048',

            ],

        ];
    }

    public function messages(): array
    {
        return [

            'photo.required' => 'Veuillez sélectionner une photo.',

            'photo.image' => 'Le fichier doit être une image.',

            'photo.max' => 'La taille maximale est de 2 Mo.',

        ];
    }
}