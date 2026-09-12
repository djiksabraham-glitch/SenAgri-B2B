<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'statut' => [

                'required',

                Rule::in([
                    'en_attente',
                    'confirmee',
                    'expediee',
                    'livree',
                    'annulee'
                ])

            ]

        ];
    }

    public function messages(): array
    {
        return [

            'statut.required' => 'Le statut est obligatoire.',

            'statut.in' => 'Le statut est invalide.',

        ];
    }
}