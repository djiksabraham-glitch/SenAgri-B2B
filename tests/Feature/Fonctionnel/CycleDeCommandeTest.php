<?php

namespace Tests\Feature\Fonctionnel;

use Tests\TestCase;
use App\Models\User;
use App\Models\Commande;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CycleDeCommandeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T12 - Fonctionnel : Cycle de commande (Statuts correctement mis à jour)
     */
    public function test_cycle_de_vie_complet_d_une_commande(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $acheteur = User::factory()->create(['role' => 'acheteur']);

        $commande = Commande::factory()->create([
            'user_id' => $acheteur->id,
            'statut' => 'en_attente',
        ]);

        Sanctum::actingAs($vendeur);

        // 1. Validation de la commande par le vendeur
        $response1 = $this->putJson("/api/commandes/{$commande->id}", [
            'statut' => 'confirmee',
        ]);
        $response1->assertStatus(200)->assertJsonPath('data.statut', 'confirmee');
        $this->assertDatabaseHas('commandes', ['id' => $commande->id, 'statut' => 'confirmee']);

        // 2. Expédition de la commande
        $response2 = $this->putJson("/api/commandes/{$commande->id}", [
            'statut' => 'expediee',
        ]);
        $response2->assertStatus(200)->assertJsonPath('data.statut', 'expediee');
        $this->assertDatabaseHas('commandes', ['id' => $commande->id, 'statut' => 'expediee']);

        // 3. Livraison de la commande
        $response3 = $this->putJson("/api/commandes/{$commande->id}", [
            'statut' => 'livree',
        ]);
        $response3->assertStatus(200)->assertJsonPath('data.statut', 'livree');
        $this->assertDatabaseHas('commandes', ['id' => $commande->id, 'statut' => 'livree']);
    }
}
