<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Notifications",
    description: "Gestion des notifications des utilisateurs"
)]
class NotificationController extends Controller
{
    #[OA\Get(
        path: "/notifications",
        summary: "Lister les notifications",
        description: "Retourne la liste paginée des notifications de l'utilisateur connecté.",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des notifications récupérée avec succès"
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    public function index(Request $request)
    {
        return response()->json([

            'notifications' => $request
                ->user()
                ->notifications()
                ->latest()
                ->paginate(15)

        ]);
    }

    #[OA\Patch(
        path: "/notifications/{id}/read",
        summary: "Marquer une notification comme lue",
        description: "Marque une notification spécifique comme lue.",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de la notification",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(
        response: 200,
        description: "Notification marquée comme lue"
    )]
    #[OA\Response(
        response: 404,
        description: "Notification introuvable"
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    public function read(Request $request, string $id)
    {
        $notification = $request
            ->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([

            'message' => 'Notification lue.'

        ]);
    }

    #[OA\Patch(
        path: "/notifications/read-all",
        summary: "Marquer toutes les notifications comme lues",
        description: "Marque toutes les notifications non lues de l'utilisateur connecté comme lues.",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Toutes les notifications ont été marquées comme lues"
    )]
    #[OA\Response(
        response: 401,
        description: "Utilisateur non authentifié"
    )]
    public function readAll(Request $request)
    {
        $request
            ->user()
            ->unreadNotifications
            ->markAsRead();

        return response()->json([

            'message' => 'Toutes les notifications sont marquées comme lues.'

        ]);
    }
}