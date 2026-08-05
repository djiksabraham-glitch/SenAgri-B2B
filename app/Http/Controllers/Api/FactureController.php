<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use Barryvdh\DomPDF\Facade\Pdf;

class FactureController extends Controller
{
    public function download(Commande $commande)
    {
        $commande->load([
            'offre',
            'offre.vendeur',
            'acheteur'
        ]);

        $pdf = Pdf::loadView(
            'factures.facture',
            compact('commande')
        );

        return $pdf->download(
            'Facture-' . $commande->id . '.pdf'
        );
    }
}