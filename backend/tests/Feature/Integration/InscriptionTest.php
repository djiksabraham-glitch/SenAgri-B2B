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
            'cgu_acceptees' => true,
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'nom', 'email', 'role', 'cgu_acceptees_le']
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ousmane@senagri.sn',
            'nom' => 'Ousmane Sow',
            'role' => 'vendeur',
        ]);

        $this->assertNotNull($response->json('user.cgu_acceptees_le'));
    }

    /**
     * Teste que l'inscription échoue sans acceptation des CGU (Loi 2008-12 & CDP).
     */
    public function test_inscription_echoue_sans_acceptation_des_cgu(): void
    {
        $userData = [
            'nom' => 'Fatou Ndiaye',
            'email' => 'fatou@senagri.sn',
            'password' => 'Passer123',
            'password_confirmation' => 'Passer123',
            'telephone' => '771234567',
            'adresse' => 'Thiès',
            'role' => 'acheteur',
            'cgu_acceptees' => false,
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cgu_acceptees']);
    }
}
