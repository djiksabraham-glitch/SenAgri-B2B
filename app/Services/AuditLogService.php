<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogService
{
    /**
     * Enregistrer une action dans les logs.
     */
    public static function log(
        ?User $user,
        string $action,
        string $table,
        int $enregistrementId,
        ?array $anciennesValeurs = null,
        ?array $nouvellesValeurs = null
    ): void {

        AuditLog::create([

            'user_id' => $user?->id,

            'action' => $action,

            'table_concernee' => $table,

            'enregistrement_id' => $enregistrementId,

            'anciennes_valeurs' => $anciennesValeurs,

            'nouvelles_valeurs' => $nouvellesValeurs,

            'date_action' => now(),

        ]);

    }
}