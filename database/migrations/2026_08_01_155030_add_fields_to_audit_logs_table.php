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
    Schema::table('audit_logs', function (Blueprint $table) {

        

        


       

        

        

        $table->timestamp('date_action')->nullable();
    });
}

public function down(): void
{
    Schema::table('audit_logs', function (Blueprint $table) {

        $table->dropForeign(['user_id']);

        $table->dropColumn([
            'user_id',
            'action',
            'table_concernee',
            'enregistrement_id',
            'anciennes_valeurs',
            'nouvelles_valeurs',
            'date_action'
        ]);
    });
}
};
