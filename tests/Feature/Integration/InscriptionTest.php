<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InscriptionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T05 - Intégration : Inscription (Utilisateur enregistré)
     */
    public function test_inscription_utilisateur_enregistre_avec_succes(): void
    {
        $userData = [
            'nom' => 'Ousmane Sow',
            'email' => 'ousmane@senagri.sn',
            'password' => 'Passer123',
            'password_confirmation' => 'Passer123',
            'telephone' => '771234567',
            'adresse' => 'Dakar, Sénégal',
            'role' => 'vendeur',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'nom', 'email', 'role']
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ousmane@senagri.sn',
            'nom' => 'Ousmane Sow',
            'role' => 'vendeur',
        ]);
    }
}
