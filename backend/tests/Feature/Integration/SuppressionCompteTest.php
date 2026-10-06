<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class SuppressionCompteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Teste la suppression définitive de compte utilisateur (Loi n° 2008-12 & CDP).
     */
    public function test_utilisateur_peut_supprimer_son_compte(): void
    {
        $user = User::factory()->create([
            'nom' => 'Moussa Diop',
            'email' => 'moussa@senagri.sn',
            'role' => 'acheteur',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/profil/account');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Votre compte et toutes vos données personnelles ont été supprimés avec succès.'
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
            'email' => 'moussa@senagri.sn',
        ]);
    }
}
