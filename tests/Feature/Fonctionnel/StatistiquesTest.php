<?php

namespace Tests\Feature\Fonctionnel;

use Tests\TestCase;
use App\Models\User;
use App\Models\Offre;
use App\Models\Commande;
use App\Models\Categorie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class StatistiquesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T13 - Fonctionnel : Statistiques (Indicateurs correctement affichés)
     */
    public function test_indicateurs_statistiques_correctement_affiches(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $acheteur = User::factory()->create(['role' => 'acheteur']);
        $categorie = Categorie::factory()->create();

        $offre = Offre::factory()->create([
            'user_id' => $vendeur->id,
            'categorie_id' => $categorie->id,
            'prix_unitaire' => 10000,
            'est_disponible' => true,
        ]);

        Commande::factory()->create([
            'user_id' => $acheteur->id,
            'offre_id' => $offre->id,
            'quantite' => 2,
            'prix_total' => 20000,
        ]);

        Sanctum::actingAs($vendeur);

        $response = $this->getJson('/api/statistiques');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'utilisateurs',
                'vendeurs',
                'offres',
                'offres_disponibles',
                'categories',
                'commandes',
                'chiffre_affaires',
                'quantite_vendue',
                'produits_plus_vendus',
                'ventes_par_mois',
            ])
            ->assertJson([
                'utilisateurs' => 2,
                'vendeurs' => 1,
                'offres' => 1,
                'offres_disponibles' => 1,
                'categories' => 1,
                'commandes' => 1,
                'chiffre_affaires' => 20000,
                'quantite_vendue' => 2,
            ]);
    }
}
