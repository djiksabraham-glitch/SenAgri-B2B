<?php

namespace Database\Factories;

use App\Models\Categorie;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategorieFactory extends Factory
{
    protected $model = Categorie::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'est_active' => true,
        ];
    }
}
