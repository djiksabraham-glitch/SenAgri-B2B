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
        Schema::create('paiements', function (Blueprint $table) {

            $table->id();

            $table->foreignId('commande_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->string('transaction_id')->nullable();

            $table->string('reference')->unique();

            $table->decimal('montant', 12, 2);

            $table->string('devise')->default('XOF');

            $table->enum('methode', [
                'wave',
                'orange_money',
                'free_money',
                'carte'
            ])->nullable();

            $table->enum('statut', [
                'en_attente',
                'reussi',
                'echoue'
            ])->default('en_attente');

            $table->timestamp('date_paiement')->nullable();

            $table->json('reponse_paydunya')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};