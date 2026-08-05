<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offres', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('categorie_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('nom');

            $table->text('description');

            $table->decimal('prix_unitaire', 10, 2);

            $table->integer('quantite_disponible');

            $table->string('unite');

            $table->boolean('est_disponible')->default(true);

            $table->timestamp('date_publication');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offres');
    }
};