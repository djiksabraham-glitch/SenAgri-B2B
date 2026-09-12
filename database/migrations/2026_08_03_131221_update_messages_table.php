<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('expediteur_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('destinataire_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('offre_id')->nullable()->constrained('offres')->nullOnDelete();
                $table->text('contenu');
                $table->boolean('lu')->default(false);
                $table->timestamp('date_envoi')->useCurrent();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // No action on down to avoid dropping original table
    }
};