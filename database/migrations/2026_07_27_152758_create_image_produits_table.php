<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('image_produits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('offre_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('chemin_fichier');

            $table->unsignedTinyInteger('ordre_affichage');

            $table->timestamp('date_upload');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_produits');
    }
};
