<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Offre;
use App\Models\ImageProduit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

class NombreImagesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T03 - Unitaire : Nombre d'images (Maximum 3 images accepté)
     */
    public function test_une_offre_ne_peut_pas_contenir_plus_de_3_images(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'vendeur']);
        $offre = Offre::factory()->create(['user_id' => $user->id]);

        // Créer déjà 3 images pour l'offre
        ImageProduit::factory()->count(3)->create([
            'offre_id' => $offre->id,
        ]);

        Sanctum::actingAs($user);

        // Tentative d'ajout d'une 4ème image
        $response = $this->postJson("/api/offres/{$offre->id}/images", [
            'image' => UploadedFile::fake()->create('produit4.jpg', 10, 'image/jpeg'),
            'ordre_affichage' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Une offre ne peut contenir que 3 images.'
            ]);
    }
}
