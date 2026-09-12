<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use App\Models\Offre;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'expediteur_id' => User::factory(),
            'destinataire_id' => User::factory(),
            'offre_id' => null,
            'contenu' => fake()->sentence(),
            'lu' => false,
            'date_envoi' => now(),
        ];
    }
}
