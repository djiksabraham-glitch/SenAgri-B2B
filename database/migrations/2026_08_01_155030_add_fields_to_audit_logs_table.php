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
        if (!Schema::hasColumn('audit_logs', 'date_action')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->timestamp('date_action')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('audit_logs', 'date_action')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->dropColumn(['date_action']);
            });
        }
    }
};
