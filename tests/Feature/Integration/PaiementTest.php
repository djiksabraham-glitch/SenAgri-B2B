<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Commande;
use App\Models\Paiement;
use App\Services\PayDunyaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Mockery\MockInterface;

class PaiementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T08 - Intégration : Paiement (Paiement correctement associé à la commande)
     */
    public function test_paiement_correctement_associe_a_la_commande(): void
    {
        $acheteur = User::factory()->create(['role' => 'acheteur']);
        $commande = Commande::factory()->create([
            'user_id' => $acheteur->id,
            'statut' => 'en_attente',
            'prix_total' => 25000,
        ]);

        // Mock du service PayDunya pour éviter l'appel HTTP externe
        $this->mock(PayDunyaService::class, function (MockInterface $mock) use ($commande) {
            $mock->shouldReceive('createInvoice')
                ->once()
                ->with(Mockery::on(fn ($c) => $c->id === $commande->id))
                ->andReturn([
                    'success' => true,
                    'token' => 'TOKEN_PAYDUNYA_TEST_123',
                    'url' => 'https://paydunya.com/sandbox-checkout/invoice/TOKEN_PAYDUNYA_TEST_123'
                ]);
        });

        Sanctum::actingAs($acheteur);

        $response = $this->postJson("/api/paiements/{$commande->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'url',
                'paiement' => ['id', 'commande_id', 'reference', 'montant']
            ]);

        $this->assertDatabaseHas('paiements', [
            'commande_id' => $commande->id,
            'reference' => 'TOKEN_PAYDUNYA_TEST_123',
            'montant' => 25000,
            'statut' => 'en_attente',
        ]);
    }
}
