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

            'role' => ['required', 'in:acheteur,vendeur']

        ];
    }
}