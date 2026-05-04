<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status', 32)->default('active')->after('password');
            $table->timestamp('onboarding_completed_at')->nullable()->after('account_status');
            $table->boolean('two_factor_enabled')->default(false)->after('onboarding_completed_at');
            $table->string('phone', 32)->nullable()->after('two_factor_enabled');
            $table->string('job_title', 120)->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'account_status',
                'onboarding_completed_at',
                'two_factor_enabled',
                'phone',
                'job_title',
            ]);
        });
    }
};
