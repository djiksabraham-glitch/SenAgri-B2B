<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategorieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($this->route('categorie')),
            ],
            'description' => 'nullable|string|max:1000',
            'est_active' => 'boolean'
        ];
    }

    public function messages(): array
{
    return [
        'nom.required' => 'Le nom de la catégorie est obligatoire.',
        'nom.unique' => 'Une catégorie avec ce nom existe déjà.',
        'nom.max' => 'Le nom ne doit pas dépasser 255 caractères.',
    ];
}

}