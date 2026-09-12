<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [

            'destinataire_id' => [
                'required',
                'exists:users,id'
            ],

            'offre_id' => [
                'nullable',
                'exists:offres,id'
            ],

            'contenu' => [
                'required',
                'string',
                'max:5000'
            ],

        ];
    }

    public function messages(): array
    {
        return [

            'destinataire_id.required' => 'Le destinataire est obligatoire.',

            'destinataire_id.exists' => 'Destinataire introuvable.',

            'offre_id.exists' => 'Offre introuvable.',

            'contenu.required' => 'Le message est obligatoire.',

        ];
    }
}