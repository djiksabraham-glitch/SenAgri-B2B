<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\User;
use App\Models\Offre;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    public function definition(): array
    {
        $quantite = fake()->numberBetween(1, 10);
        $prixUnitaire = 1000;

        return [
            'offre_id' => Offre::factory()->state(['prix_unitaire' => $prixUnitaire]),
            'user_id' => User::factory()->state(['role' => 'acheteur']),
            'quantite' => $quantite,
            'prix_total' => $quantite * $prixUnitaire,
            'statut' => 'en_attente',
            'date_commande' => now(),
        ];
    }
}
