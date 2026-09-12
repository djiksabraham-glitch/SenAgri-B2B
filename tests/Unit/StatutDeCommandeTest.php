<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Commande;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class StatutDeCommandeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T04 - Unitaire : Statut de commande (Seuls les statuts autorisés sont acceptés)
     */
    public function test_seuls_les_statuts_autorises_sont_acceptes(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $commande = Commande::factory()->create(['statut' => 'en_attente']);

        Sanctum::actingAs($user);

        // Test 1: Statut valide ('confirmee')
        $responseValide = $this->putJson("/api/commandes/{$commande->id}", [
            'statut' => 'confirmee',
        ]);

        $responseValide->assertStatus(200)
            ->assertJsonPath('data.statut', 'confirmee');

        // Test 2: Statut invalide ('invalide_status')
        $responseInvalide = $this->putJson("/api/commandes/{$commande->id}", [
            'statut' => 'invalide_status',
        ]);

        $responseInvalide->assertStatus(422)
            ->assertJsonValidationErrors(['statut']);
    }
}
