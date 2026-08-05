<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Exécuter les migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {

            $table->id();

            // Utilisateur ayant effectué l'action
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Action effectuée
            $table->string('action');

            // Table concernée
            $table->string('table_concernee');

            // ID de l'enregistrement concerné
            $table->unsignedBigInteger('enregistrement_id');

            // Anciennes valeurs (avant modification)
            $table->json('anciennes_valeurs')->nullable();

            // Nouvelles valeurs (après modification)
            $table->json('nouvelles_valeurs')->nullable();

            // Date de l'action
            $table->timestamp('date_action');

            $table->timestamps();
        });
    }

    /**
     * Annuler les migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};