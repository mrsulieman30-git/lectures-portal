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
        Schema::table('semesters', function (Blueprint $table) {
            $table->boolean('auto_promote')->default(true)->after('sort_order');
            $table->foreignId('next_semester_id')->nullable()->after('auto_promote')->constrained('semesters')->nullOnDelete();
            $table->timestamp('promoted_at')->nullable()->after('next_semester_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropForeign(['next_semester_id']);
            $table->dropColumn(['auto_promote', 'next_semester_id', 'promoted_at']);
        });
    }
};
