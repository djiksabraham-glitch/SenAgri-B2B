<?php

namespace Tests\Feature\Fonctionnel;

use Tests\TestCase;
use App\Models\User;
use App\Models\Offre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ParcoursAcheteurTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T10 - Fonctionnel : Parcours acheteur (Consultation puis commande réussie)
     */
    public function test_parcours_complet_acheteur_consultation_puis_commande_reussie(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $acheteur = User::factory()->create(['role' => 'acheteur']);

        $offre = Offre::factory()->create([
            'user_id' => $vendeur->id,
            'nom' => 'Maïs blanc du Sud',
            'prix_unitaire' => 15000,
            'quantite_disponible' => 50,
            'est_disponible' => true,
        ]);

        Sanctum::actingAs($acheteur);

        // Étape 1 : Consultation du catalogue des offres
        $responseCatalogue = $this->getJson('/api/offres');
        $responseCatalogue->assertStatus(200)
            ->assertJsonPath('data.0.id', $offre->id);

        // Étape 2 : Consultation détaillée de l'offre
        $responseOffre = $this->getJson("/api/offres/{$offre->id}");
        $responseOffre->assertStatus(200)
            ->assertJsonPath('data.nom', 'Maïs blanc du Sud');

        // Étape 3 : Passation de la commande
        $responseCommande = $this->postJson('/api/commandes', [
            'offre_id' => $offre->id,
            'quantite' => 10,
        ]);

        $responseCommande->assertStatus(201)
            ->assertJsonPath('data.prix_total', '150000.00');

        // Vérification en base de données
        $this->assertDatabaseHas('commandes', [
            'user_id' => $acheteur->id,
            'offre_id' => $offre->id,
            'quantite' => 10,
            'statut' => 'en_attente',
        ]);

        // Vérification de la diminution du stock disponible
        $this->assertDatabaseHas('offres', [
            'id' => $offre->id,
            'quantite_disponible' => 40,
        ]);
    }
}
