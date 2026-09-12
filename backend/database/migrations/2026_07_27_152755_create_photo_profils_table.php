<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_profils', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->string('nom_fichier');

            $table->string('url');

            $table->string('type_mime');

            $table->unsignedBigInteger('taille');

            $table->timestamps();

            // Un utilisateur ne peut avoir qu'une seule photo
            $table->unique('user_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_profils');
    }
};