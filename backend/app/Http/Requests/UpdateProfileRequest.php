<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [

            'nom' => 'sometimes|string|max:255',

            'telephone' => 'sometimes|string|max:20',

            'adresse' => 'sometimes|string|max:255',

            'email' => [

                'sometimes',

                'email',

                Rule::unique('users')->ignore($user->id),

            ],

        ];
    }
}