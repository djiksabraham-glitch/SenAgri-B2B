<?php

namespace Tests\Feature\Fonctionnel;

use Tests\TestCase;
use App\Models\User;
use App\Models\Categorie;
use App\Models\Offre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ParcoursVendeurTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T11 - Fonctionnel : Parcours vendeur (Offre publiée et gérée correctement)
     */
    public function test_parcours_complet_vendeur_publication_et_gestion_d_offre(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $categorie = Categorie::factory()->create(['nom' => 'Fruits']);

        Sanctum::actingAs($vendeur);

        // Étape 1 : Publication d'une nouvelle offre
        $nouveauProduit = [
            'categorie_id' => $categorie->id,
            'nom' => 'Mangues Kent',
            'description' => 'Mangues fraîches et sucrées récoltées dans la région de Casamance.',
            'prix_unitaire' => 800,
            'quantite_disponible' => 200,
            'unite' => 'kg',
            'est_disponible' => true,
        ];

        $responseCreate = $this->postJson('/api/offres', $nouveauProduit);

        $responseCreate->assertStatus(201)
            ->assertJsonPath('data.nom', 'Mangues Kent');

        $offreId = $responseCreate->json('data.id');

        // Étape 2 : Modification / Mise à jour du prix et stock de l'offre
        $updateData = [
            'prix_unitaire' => 750,
            'quantite_disponible' => 180,
        ];

        $responseUpdate = $this->putJson("/api/offres/{$offreId}", $updateData);

        $responseUpdate->assertStatus(200)
            ->assertJsonPath('data.prix_unitaire', "750.00");

        // Vérification de la mise à jour en BDD
        $this->assertDatabaseHas('offres', [
            'id' => $offreId,
            'user_id' => $vendeur->id,
            'prix_unitaire' => 750,
            'quantite_disponible' => 180,
        ]);
    }
}
