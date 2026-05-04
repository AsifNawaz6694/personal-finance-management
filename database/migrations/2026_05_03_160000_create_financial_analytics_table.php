<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('type', ['spending_trend', 'budget_utilization', 'category_breakdown', 'monthly_comparison', 'prediction', 'anomaly']);
            $table->string('title');
            $table->text('description');
            $table->json('data'); // Analytical data and metrics
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->enum('status', ['active', 'acknowledged', 'dismissed'])->default('active');
            $table->date('analysis_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->json('recommendations')->nullable(); // Actionable recommendations
            $table->timestamps();

            $table->index(['user_id', 'type', 'status']);
            $table->index(['budget_id', 'analysis_date']);
            $table->index(['severity', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_analytics');
    }
};
