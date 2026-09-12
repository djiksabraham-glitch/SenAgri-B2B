<?php

namespace Database\Factories;

use App\Models\Offre;
use App\Models\User;
use App\Models\Categorie;
use Illuminate\Database\Eloquent\Factories\Factory;

class OffreFactory extends Factory
{
    protected $model = Offre::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'vendeur']),
            'categorie_id' => Categorie::factory(),
            'nom' => fake()->words(2, true),
            'description' => fake()->paragraph(),
            'prix_unitaire' => fake()->randomFloat(2, 500, 50000),
            'quantite_disponible' => fake()->numberBetween(10, 500),
            'unite' => 'kg',
            'est_disponible' => true,
            'date_publication' => now(),
        ];
    }
}
