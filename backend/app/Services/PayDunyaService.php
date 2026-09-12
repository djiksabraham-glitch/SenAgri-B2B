<?php

namespace App\Services;

use Paydunya\Checkout\CheckoutInvoice;
use Paydunya\Checkout\Store;
use Paydunya\Setup;

class PayDunyaService
{
    public function __construct()
    {
        Setup::setMasterKey(config('paydunya.master_key'));
        Setup::setPrivateKey(config('paydunya.private_key'));
        Setup::setPublicKey(config('paydunya.public_key'));
        Setup::setToken(config('paydunya.token'));
        Setup::setMode(config('paydunya.mode'));

        Store::setName(config('app.name'));
        Store::setTagline('Plateforme agricole B2B');
        Store::setPhoneNumber('+221770000000');
        Store::setPostalAddress('Dakar - Sénégal');
        Store::setWebsiteUrl(config('app.url'));
        Store::setLogoUrl(config('app.url').'/logo.png');

        Store::setReturnUrl(config('app.url').'/paiement/success');
        Store::setCancelUrl(config('app.url').'/paiement/cancel');
        Store::setCallbackUrl(config('app.url').'/api/auth/paiement/callback');
    }

    public function createInvoice($commande)
    {
        $invoice = new CheckoutInvoice();

        $invoice->addItem(
            "Commande #".$commande->id,
            $commande->quantite,
            $commande->offre->prix_unitaire,
            $commande->prix_total,
            $commande->offre->nom
        );

        $invoice->setTotalAmount($commande->prix_total);

        $invoice->setDescription(
            "Paiement de la commande ".$commande->id
        );

        // On stocke l'id de la commande chez PayDunya
        $invoice->addCustomData(
            "commande_id",
            $commande->id
        );

        if ($invoice->create()) {

            return [
                'success' => true,
                'token'   => $invoice->token,
                'url'     => $invoice->getInvoiceUrl()
            ];
        }

        return [
            'success' => false,
            'message' => $invoice->response_text
        ];
    }
}