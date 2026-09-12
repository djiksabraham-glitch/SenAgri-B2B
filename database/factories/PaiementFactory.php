<?php

namespace Database\Factories;

use App\Models\Paiement;
use App\Models\Commande;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaiementFactory extends Factory
{
    protected $model = Paiement::class;

    public function definition(): array
    {
        return [
            'commande_id' => Commande::factory(),
            'transaction_id' => 'TRX-' . fake()->numberBetween(100000, 999999),
            'reference' => 'PAY-' . fake()->date('Ymd') . '-' . fake()->numberBetween(1000, 9999),
            'montant' => 10000,
            'devise' => 'XOF',
            'methode' => 'wave',
            'statut' => 'paye',
            'date_paiement' => now(),
        ];
    }
}
