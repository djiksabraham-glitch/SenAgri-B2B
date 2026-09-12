<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Offre;
use App\Models\Commande;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CalculDuPrixTotalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T01 - Unitaire : Calcul du prix total (Montant correctement calculé)
     */
    public function test_le_prix_total_de_la_commande_est_correctement_calcule(): void
    {
        $quantite = 5;
        $prixUnitaire = 2500;
        $prixAttendu = $quantite * $prixUnitaire; // 12500

        $offre = Offre::factory()->create([
            'prix_unitaire' => $prixUnitaire,
        ]);

        $commande = Commande::factory()->create([
            'offre_id' => $offre->id,
            'quantite' => $quantite,
            'prix_total' => $offre->prix_unitaire * $quantite,
        ]);

        $this->assertEquals($prixAttendu, $commande->prix_total);
    }
}
