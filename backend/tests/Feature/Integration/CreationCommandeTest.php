<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Offre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CreationCommandeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T07 - Intégration : Création de commande (Commande liée à l'acheteur et à l'offre)
     */
    public function test_creation_commande_liee_a_l_acheteur_et_a_l_offre(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $acheteur = User::factory()->create(['role' => 'acheteur']);

        $offre = Offre::factory()->create([
            'user_id' => $vendeur->id,
            'prix_unitaire' => 5000,
            'quantite_disponible' => 20,
            'est_disponible' => true,
        ]);

        Sanctum::actingAs($acheteur);

        $commandeData = [
            'offre_id' => $offre->id,
            'quantite' => 3,
        ];

        $response = $this->postJson('/api/commandes', $commandeData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'quantite', 'prix_total', 'statut']
            ]);

        $this->assertDatabaseHas('commandes', [
            'user_id' => $acheteur->id,
            'offre_id' => $offre->id,
            'quantite' => 3,
            'prix_total' => 15000,
        ]);
    }
}
