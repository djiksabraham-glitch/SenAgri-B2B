<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Categorie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CreationOffreTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T06 - Intégration : Création d'offre (Offre enregistrée et liée au vendeur)
     */
    public function test_creation_offre_enregistree_et_liee_au_vendeur(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $categorie = Categorie::factory()->create(['nom' => 'Légumes']);

        Sanctum::actingAs($vendeur);

        $offreData = [
            'categorie_id' => $categorie->id,
            'nom' => 'Oignons de Niayes',
            'description' => 'Sacs d oignons de grande qualité récoltés à la main.',
            'prix_unitaire' => 12000,
            'quantite_disponible' => 50,
            'unite' => 'Sac',
            'est_disponible' => true,
        ];

        $response = $this->postJson('/api/offres', $offreData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'nom', 'prix_unitaire', 'quantite_disponible']
            ]);

        $this->assertDatabaseHas('offres', [
            'user_id' => $vendeur->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Oignons de Niayes',
        ]);
    }
}
