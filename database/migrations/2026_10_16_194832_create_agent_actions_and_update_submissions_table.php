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
        Schema::create('agent_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->string('action_type')->default('grade_submission');
            $table->string('target_type')->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->integer('grade')->nullable();
            $table->text('feedback')->nullable();
            $table->longText('ocr_text')->nullable();
            $table->float('ai_generated_probability')->nullable();
            $table->string('ai_detection_verdict')->nullable();
            $table->text('reasoning')->nullable();
            $table->json('payload')->nullable();
            $table->string('status')->default('pending_approval');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['status', 'action_type']);
            $table->index(['target_type', 'target_id']);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->longText('ocr_text')->nullable()->after('text_content');
            $table->float('ai_probability')->nullable()->after('ocr_text');
            $table->string('ai_verdict')->nullable()->after('ai_probability');
            $table->unsignedBigInteger('agent_action_id')->nullable()->after('graded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['ocr_text', 'ai_probability', 'ai_verdict', 'agent_action_id']);
        });

        Schema::dropIfExists('agent_actions');
    }
};
