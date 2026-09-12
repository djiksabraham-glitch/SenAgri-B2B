<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Offre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class VerificationDuStockTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T02 - Unitaire : Vérification du stock (Commande refusée si stock insuffisant)
     */
    public function test_commande_refusee_si_stock_insuffisant(): void
    {
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $acheteur = User::factory()->create(['role' => 'acheteur']);

        $offre = Offre::factory()->create([
            'user_id' => $vendeur->id,
            'quantite_disponible' => 10,
            'est_disponible' => true,
        ]);

        Sanctum::actingAs($acheteur);

        // Tenter de commander 15 articles alors qu'il n'y en a que 10
        $response = $this->postJson('/api/commandes', [
            'offre_id' => $offre->id,
            'quantite' => 15,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Stock insuffisant.'
            ]);
    }
}
