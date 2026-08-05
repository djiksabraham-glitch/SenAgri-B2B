<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class NouvelleCommandeNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Commande $commande
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([

            'message' => 'Vous avez reçu une nouvelle commande.',

            'commande_id' => $this->commande->id,

            'offre_id' => $this->commande->offre_id,

            'acheteur' => $this->commande->acheteur->nom,

            'quantite' => $this->commande->quantite,

            'prix_total' => $this->commande->prix_total,

        ]);
    }
}