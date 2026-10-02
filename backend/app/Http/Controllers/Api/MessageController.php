<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NouveauMessageNotification;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Messagerie",
    description: "Messagerie entre acheteurs et vendeurs"
)]
class MessageController extends Controller
{
    #[OA\Get(
        path: "/messages",
        summary: "Lister les conversations",
        description: "Retourne les conversations de l'utilisateur connecté.",
        tags: ["Messagerie"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des conversations récupérée."
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié."
    )]
    public function index()
    {
        $user = auth()->id();

        $messages = Message::with([
                'expediteur',
                'destinataire',
                'offre'
            ])
            ->where('expediteur_id', $user)
            ->orWhere('destinataire_id', $user)
            ->latest('date_envoi')
            ->get();

        $conversations = $messages
            ->groupBy(function ($message) use ($user) {

                return $message->expediteur_id == $user
                    ? $message->destinataire_id
                    : $message->expediteur_id;

            })
            ->map(function ($conversation) use ($user) {

                $dernier = $conversation->first();

                $interlocuteur = $dernier->expediteur_id == $user
                    ? $dernier->destinataire
                    : $dernier->expediteur;

                if (!$interlocuteur) {
                    return null;
                }

                return [

                    'utilisateur' => [

                        'id' => $interlocuteur->id,

                        'nom' => $interlocuteur->nom,

                        'email' => $interlocuteur->email,

                        'role' => $interlocuteur->role ?? null,

                    ],

                    'dernier_message' => $dernier->contenu,

                    'date_envoi' => $dernier->date_envoi,

                    'non_lus' => Message::where('expediteur_id', $interlocuteur->id)
                        ->where('destinataire_id', $user)
                        ->where('lu', false)
                        ->count(),

                ];

            })
            ->filter()
            ->values();

        return response()->json([
            'data' => $conversations
        ]);
    }

        #[OA\Get(
        path: "/messages/{user}",
        summary: "Afficher une conversation",
        description: "Retourne tous les messages échangés entre l'utilisateur connecté et un autre utilisateur.",
        tags: ["Messagerie"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "user",
        description: "Identifiant de l'utilisateur",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Conversation récupérée avec succès."
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié."
    )]
    #[OA\Response(
        response: 404,
        description: "Utilisateur introuvable."
    )]
    public function conversation(User $user)
    {
        $messages = Message::with([
                'expediteur',
                'destinataire',
                'offre'
            ])
            ->where(function ($query) use ($user) {

                $query->where('expediteur_id', auth()->id())
                      ->where('destinataire_id', $user->id);

            })
            ->orWhere(function ($query) use ($user) {

                $query->where('expediteur_id', $user->id)
                      ->where('destinataire_id', auth()->id());

            })
            ->orderBy('date_envoi')
            ->get();

        return MessageResource::collection($messages);
    }

        #[OA\Post(
        path: "/messages",
        summary: "Envoyer un message",
        description: "Permet à l'utilisateur connecté d'envoyer un message à un autre utilisateur.",
        tags: ["Messagerie"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["destinataire_id", "contenu"],
            properties: [
                new OA\Property(
                    property: "destinataire_id",
                    type: "integer",
                    example: 5
                ),
                new OA\Property(
                    property: "offre_id",
                    type: "integer",
                    nullable: true,
                    example: 12
                ),
                new OA\Property(
                    property: "contenu",
                    type: "string",
                    example: "Bonjour, votre produit est-il toujours disponible ?"
                )
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Message envoyé avec succès."
    )]
    #[OA\Response(
        response: 422,
        description: "Données invalides."
    )]
    #[OA\Response(
        response: 403,
        description: "Impossible de s'envoyer un message à soi-même."
    )]
    public function store(StoreMessageRequest $request)
    {
        // Empêcher l'utilisateur de s'envoyer un message
        if ($request->destinataire_id == auth()->id()) {

            return response()->json([
                'message' => 'Vous ne pouvez pas vous envoyer un message.'
            ], 403);

        }

        $message = Message::create([

            'expediteur_id' => auth()->id(),

            'destinataire_id' => $request->destinataire_id,

            'offre_id' => $request->offre_id,

            'contenu' => $request->contenu,

            'lu' => false,

            'date_envoi' => now(),

        ]);

        // Charger les relations
        $message->load([
            'expediteur',
            'destinataire',
            'offre'
        ]);

        // Notification du destinataire
        $message->destinataire
            ->notify(new NouveauMessageNotification($message));

        return response()->json([

            'message' => 'Message envoyé avec succès.',

            'data' => new MessageResource($message)

        ], 201);
    }

        #[OA\Put(
        path: "/messages/{user}/read",
        summary: "Marquer une conversation comme lue",
        description: "Marque tous les messages reçus d'un utilisateur comme lus.",
        tags: ["Messagerie"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "user",
        in: "path",
        required: true,
        description: "Identifiant de l'utilisateur",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Messages marqués comme lus."
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié."
    )]
    public function markAsRead(User $user)
    {
        Message::where('expediteur_id', $user->id)
            ->where('destinataire_id', auth()->id())
            ->where('lu', false)
            ->update([
                'lu' => true
            ]);

        return response()->json([
            'message' => 'Messages marqués comme lus.'
        ]);
    }
}