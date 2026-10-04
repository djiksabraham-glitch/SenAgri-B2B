<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clearResolvedInstances();
    }

    /**
     * Teste que la route POST /api/auth/login bloque après 5 tentatives (429 Too Many Requests).
     */
    public function test_login_rate_limiting_blocks_excessive_attempts(): void
    {
        $payload = [
            'email' => 'ratelimit_login@example.com',
            'password' => 'wrong-password',
        ];

        // 5 premières tentatives (échouent pour mauvais mot de passe ou validation, mais pas 429)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/login', $payload);
            $this->assertNotEquals(429, $response->getStatusCode(), "La requête {$i} ne doit pas être bloquée par le rate limiter.");
        }

        // 6ème tentative : doit être bloquée par le Rate Limiter (429)
        $response = $this->postJson('/api/auth/login', $payload);
        $response->assertStatus(429);
        $response->assertJsonStructure(['message', 'retry_after']);
        $this->assertStringContainsString('Trop de tentatives', $response->json('message'));
    }

    /**
     * Teste que la route POST /api/auth/register bloque après 5 inscriptions rapides depuis la même IP.
     */
    public function test_register_rate_limiting_blocks_excessive_attempts(): void
    {
        $payload = [
            'nom' => 'Test User',
            'email' => 'ratelimit_reg@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'telephone' => '771234567',
            'adresse' => 'Dakar',
            'role' => 'acheteur',
        ];

        // 5 premières tentatives
        for ($i = 0; $i < 5; $i++) {
            $payload['email'] = "user{$i}_ratelimit@example.com";
            $response = $this->postJson('/api/auth/register', $payload);
            $this->assertNotEquals(429, $response->getStatusCode());
        }

        // 6ème tentative : 429 Too Many Requests
        $payload['email'] = 'user6_ratelimit@example.com';
        $response = $this->postJson('/api/auth/register', $payload);
        $response->assertStatus(429);
        $response->assertJsonStructure(['message', 'retry_after']);
        $this->assertStringContainsString('Trop de tentatives', $response->json('message'));
    }

    /**
     * Teste que la route POST /api/messages bloque après 20 envois rapides.
     */
    public function test_messages_rate_limiting_blocks_after_limit(): void
    {
        $expediteur = User::factory()->create(['role' => 'acheteur']);
        $destinataire = User::factory()->create(['role' => 'vendeur']);

        Sanctum::actingAs($expediteur);

        // Envoyer 20 messages
        for ($i = 0; $i < 20; $i++) {
            $response = $this->postJson('/api/messages', [
                'destinataire_id' => $destinataire->id,
                'contenu' => "Message test {$i}",
            ]);
            $this->assertNotEquals(429, $response->getStatusCode(), "Message {$i} ne doit pas renvoyer 429.");
        }

        // 21ème message : doit renvoyer 429
        $response = $this->postJson('/api/messages', [
            'destinataire_id' => $destinataire->id,
            'contenu' => 'Message 21 qui dépasse la limite',
        ]);

        $response->assertStatus(429);
        $response->assertJsonStructure(['message', 'retry_after']);
        $this->assertStringContainsString('patienter', $response->json('message'));
    }

    /**
     * Teste que la route POST /api/paiements/{commande} bloque après 6 tentatives.
     */
    public function test_payment_rate_limiting_blocks_after_limit(): void
    {
        $acheteur = User::factory()->create(['role' => 'acheteur']);
        Sanctum::actingAs($acheteur);

        for ($i = 0; $i < 6; $i++) {
            // Requête vers une commande (même si 404, le middleware throttle s'applique en amont ou enregistre la tentative)
            $response = $this->postJson('/api/paiements/999999');
            $this->assertNotEquals(429, $response->getStatusCode(), "Requête paiement {$i} ne doit pas être bloquée par le limiter.");
        }

        // 7ème tentative : doit être bloquée avec 429
        $response = $this->postJson('/api/paiements/999999');
        $response->assertStatus(429);
        $response->assertJsonStructure(['message', 'retry_after']);
        $this->assertStringContainsString('paiement', $response->json('message'));
    }
}
