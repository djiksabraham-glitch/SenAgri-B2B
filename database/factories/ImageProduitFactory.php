<?php

namespace Database\Factories;

use App\Models\ImageProduit;
use App\Models\Offre;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageProduitFactory extends Factory
{
    protected $model = ImageProduit::class;

    public function definition(): array
    {
        return [
            'offre_id' => Offre::factory(),
            'chemin_fichier' => 'offres/' . fake()->uuid() . '.jpg',
            'ordre_affichage' => 1,
            'date_upload' => now(),
        ];
    }
}
