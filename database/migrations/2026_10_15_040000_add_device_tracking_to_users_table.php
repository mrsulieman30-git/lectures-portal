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
        Schema::table('users', function (Blueprint $table) {
            $table->string('registered_device_token')->nullable()->index();
            $table->string('registered_device_name')->nullable();
            $table->string('registered_device_ip', 45)->nullable();
            $table->timestamp('registered_device_at')->nullable();

            $table->string('pending_device_token')->nullable();
            $table->string('pending_device_name')->nullable();
            $table->string('pending_device_ip', 45)->nullable();
            $table->text('pending_device_reason')->nullable();
            $table->timestamp('pending_device_requested_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'registered_device_token',
                'registered_device_name',
                'registered_device_ip',
                'registered_device_at',
                'pending_device_token',
                'pending_device_name',
                'pending_device_ip',
                'pending_device_reason',
                'pending_device_requested_at',
            ]);
        });
    }
};
