<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'nom' => ['required', 'string', 'max:255'],

            'email' => ['required', 'email', 'unique:users,email'],

            'password' => ['required', 'confirmed', 'min:8'],

            'telephone' => ['required', 'string', 'max:20'],

            'adresse' => ['required', 'string'],

            'role' => ['required', 'in:acheteur,vendeur'],

            'cgu_acceptees' => ['required', 'accepted'],

        ];
    }

    public function messages(): array
    {
        return [
            'cgu_acceptees.required' => 'Vous devez accepter les conditions générales d\'utilisation.',
            'cgu_acceptees.accepted' => 'Vous devez accepter les conditions générales d\'utilisation et la politique de confidentialité pour créer un compte.',
        ];
    }
}