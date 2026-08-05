<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Audit Logs",
    description: "Gestion et consultation des journaux d'audit"
)]
class AuditLogController extends Controller
{
    /**
     * Liste des logs.
     */
    #[OA\Get(
        path: "/audit-logs",
        operationId: "getAuditLogs",
        summary: "Lister les journaux d'audit",
        description: "Retourne la liste paginée de tous les journaux d'audit.",
        tags: ["Audit Logs"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Liste des journaux récupérée avec succès"
            ),
            new OA\Response(
                response: 401,
                description: "Utilisateur non authentifié"
            ),
            new OA\Response(
                response: 403,
                description: "Accès interdit"
            )
        ]
    )]
    public function index()
    {
        $logs = AuditLog::with('user')
            ->latest('date_action')
            ->paginate(20);

        return AuditLogResource::collection($logs);
    }

    /**
     * Détail d'un log.
     */
    #[OA\Get(
        path: "/audit-logs/{id}",
        operationId: "showAuditLog",
        summary: "Afficher un journal d'audit",
        description: "Retourne les informations d'un journal d'audit précis.",
        tags: ["Audit Logs"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "Identifiant du journal d'audit",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Journal récupéré avec succès"
            ),
            new OA\Response(
                response: 401,
                description: "Utilisateur non authentifié"
            ),
            new OA\Response(
                response: 404,
                description: "Journal introuvable"
            )
        ]
    )]
    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');

        return new AuditLogResource($auditLog);
    }
}