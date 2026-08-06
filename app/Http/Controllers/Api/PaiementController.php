<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Paiement;
use App\Services\PayDunyaService;
use Illuminate\Http\Request;
use Paydunya\Checkout\CheckoutInvoice;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Paiements",
    description: "Gestion des paiements PayDunya"
)]
class PaiementController extends Controller
{
    #[OA\Post(
        path: "/paiements/{commande}",
        summary: "Créer un paiement PayDunya",
        tags: ["Paiements"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "commande",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Lien de paiement généré"
    )]
    #[OA\Response(
        response: 404,
        description: "Commande introuvable"
    )]
    #[OA\Response(
        response: 422,
        description: "Commande déjà payée"
    )]
    public function payer(
        Commande $commande,
        PayDunyaService $paydunya
    )
    {
        /*
        |--------------------------------------------------------------------------
        | Vérifier que la commande appartient à l'utilisateur connecté
        |--------------------------------------------------------------------------
        */

        if ($commande->user_id != auth()->id()) {

            return response()->json([
                'message' => 'Accès refusé.'
            ],403);

        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier si elle est déjà payée
        |--------------------------------------------------------------------------
        */

        if ($commande->statut === 'payee') {

            return response()->json([
                'message' => 'Cette commande est déjà payée.'
            ],422);

        }

        /*
        |--------------------------------------------------------------------------
        | Charger l'offre
        |--------------------------------------------------------------------------
        */

        $commande->load('offre');

        /*
        |--------------------------------------------------------------------------
        | Création de la facture PayDunya
        |--------------------------------------------------------------------------
        */

        $result = $paydunya->createInvoice($commande);

        if (!$result['success']) {

            return response()->json([
                'message' => $result['message']
            ],500);

        }

        /*
        |--------------------------------------------------------------------------
        | Enregistrer le paiement
        |--------------------------------------------------------------------------
        */

        $paiement = Paiement::create([

    'commande_id' => $commande->id,

    'transaction_id' => null,

    'reference' => $result['token'],

    'montant' => $commande->prix_total,

    'devise' => 'XOF',

    // Le moyen de paiement n'est pas encore connu
    'methode' => null,

    'statut' => 'en_attente',

    'date_paiement' => null,

    'reponse_paydunya' => null,

]);

        /*
        |--------------------------------------------------------------------------
        | Retourner le lien PayDunya
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' => 'Lien de paiement généré.',

            'url' => $result['url'],

            'paiement' => $paiement

        ]);
    }


public function callback(Request $request)
{
    $token = $request->input('token');

    if (!$token) {

        return response()->json([
            'message' => 'Token manquant.'
        ],400);

    }

    $invoice = new CheckoutInvoice();

    if (!$invoice->confirm($token)) {

        $paiement = Paiement::where('reference', $token)->first();

        if ($paiement) {

            $paiement->update([

                'statut' => 'echoue',

                'reponse_paydunya' => [
                    'status' => $invoice->getStatus()
                ]

            ]);

        }

        return response()->json([
            'message' => 'Paiement non confirmé.'
        ],400);

    }

    /*
    |--------------------------------------------------------------------------
    | Récupération de la commande
    |--------------------------------------------------------------------------
    */

    $commandeId = $invoice->getCustomData('commande_id');

    $commande = Commande::findOrFail($commandeId);

    /*
    |--------------------------------------------------------------------------
    | Paiement
    |--------------------------------------------------------------------------
    */

    $paiement = Paiement::where(
        'reference',
        $token
    )->firstOrFail();

    $paiement->update([

        'transaction_id' => $token,

        'statut' => 'reussi',

        'date_paiement' => now(),

        // à adapter plus tard selon la réponse PayDunya
        'methode' => 'carte',

        'reponse_paydunya' => [

            'status' => $invoice->getStatus(),

            'token' => $token,

            'receipt' => $invoice->getReceiptUrl()

        ]

    ]);

    /*
    |--------------------------------------------------------------------------
    | Commande
    |--------------------------------------------------------------------------
    */

    $commande->update([

        'statut' => 'payee'

    ]);

    return response()->json([

        'message' => 'Paiement confirmé avec succès.'

    ]);

}


#[OA\Get(
    path: "/paiement/success",
    summary: "Retour après un paiement réussi",
    tags: ["Paiements"]
)]
#[OA\Response(
    response: 200,
    description: "Paiement effectué avec succès"
)]
/**
 * Retour après un paiement réussi.
 */
public function success(Request $request,PayDunyaService $paydunya)
{
    

    $token = $request->query('token');

    if (!$token) {
        return response()->json([
            'success' => false,
            'message' => 'Token de paiement introuvable.'
        ], 400);
    }

    $invoice = new CheckoutInvoice();

    if (!$invoice->confirm($token)) {

        return response()->json([
            'success' => false,
            'message' => 'Le paiement n\'a pas été confirmé.'
        ], 400);

    }

    /*
    |--------------------------------------------------------------------------
    | Paiement
    |--------------------------------------------------------------------------
    */

    $paiement = Paiement::where(
        'reference',
        $token
    )->first();

    if (!$paiement) {

        return response()->json([
            'success' => false,
            'message' => 'Paiement introuvable.'
        ],404);

    }

    /*
    |--------------------------------------------------------------------------
    | Éviter de traiter deux fois
    |--------------------------------------------------------------------------
    */

    if ($paiement->statut == 'reussi') {

        return response()->json([
            'success' => true,
            'message' => 'Paiement déjà confirmé.'
        ]);

    }

    /*
    |--------------------------------------------------------------------------
    | Mise à jour du paiement
    |--------------------------------------------------------------------------
    */

    $paiement->update([

        'transaction_id' => $token,

        'statut' => 'reussi',

        'date_paiement' => now(),

        'methode' => 'carte',

        'reponse_paydunya' => [

            'status' => $invoice->getStatus(),

            'receipt' => $invoice->getReceiptUrl(),

            'token' => $token

        ]

    ]);

    /*
    |--------------------------------------------------------------------------
    | Mise à jour de la commande
    |--------------------------------------------------------------------------
    */

    $commande = $paiement->commande;

    $commande->update([

        'statut' => 'confirmee'

    ]);

    return response()->json([

        'success' => true,

        'message' => 'Paiement confirmé avec succès.',

        'paiement' => $paiement->fresh(),

        'commande' => $commande->fresh()

    ]);
}

#[OA\Get(
    path: "/paiement/cancel",
    summary: "Retour après une annulation de paiement",
    tags: ["Paiements"]
)]
#[OA\Response(
    response: 200,
    description: "Paiement annulé"
)]
/**
 * Retour après une annulation.
 */
public function cancel()
{
    return response()->json([
        'success' => false,
        'message' => 'Paiement annulé.'
    ]);
}
}