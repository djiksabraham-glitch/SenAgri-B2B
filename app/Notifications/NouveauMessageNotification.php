<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class NouveauMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Message $message
    ) {
    }

    /**
     * Canaux utilisés.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Données enregistrées dans la table notifications.
     */
    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'message_id' => $this->message->id,

            'expediteur_id' => $this->message->expediteur_id,

            'expediteur_nom' => $this->message->expediteur->nom,

            'offre_id' => $this->message->offre_id,

            'contenu' => $this->message->contenu,

            'date_envoi' => $this->message->date_envoi,
        ]);
    }

    /**
     * Représentation tableau.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message_id' => $this->message->id,

            'expediteur_id' => $this->message->expediteur_id,

            'expediteur_nom' => $this->message->expediteur->nom,

            'offre_id' => $this->message->offre_id,

            'contenu' => $this->message->contenu,

            'date_envoi' => $this->message->date_envoi,
        ];
    }
}