<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class MessagerieTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T09 - Intégration : Messagerie (Message transmis entre expéditeur et destinataire)
     */
    public function test_message_transmis_entre_expediteur_et_destinataire(): void
    {
        $expediteur = User::factory()->create(['nom' => 'Expéditeur']);
        $destinataire = User::factory()->create(['nom' => 'Destinataire']);

        Sanctum::actingAs($expediteur);

        $messageData = [
            'destinataire_id' => $destinataire->id,
            'contenu' => 'Bonjour, votre offre de riz est-elle toujours disponible ?',
        ];

        $response = $this->postJson('/api/messages', $messageData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'contenu', 'lu']
            ]);

        $this->assertDatabaseHas('messages', [
            'expediteur_id' => $expediteur->id,
            'destinataire_id' => $destinataire->id,
            'contenu' => 'Bonjour, votre offre de riz est-elle toujours disponible ?',
            'lu' => false,
        ]);
    }
}
