<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spending_patterns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_category_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('category_name'); // For historical reference even if category is deleted
            $table->enum('period_type', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('total_spent', 15, 2);
            $table->integer('transaction_count');
            $table->decimal('average_transaction', 15, 2);
            $table->decimal('median_transaction', 15, 2);
            $table->decimal('min_transaction', 15, 2);
            $table->decimal('max_transaction', 15, 2);
            $table->decimal('std_deviation', 15, 2)->nullable(); // For anomaly detection
            $table->decimal('trend_percentage', 8, 2)->nullable(); // Change from previous period
            $table->json('metadata')->nullable(); // Additional pattern data
            $table->timestamps();

            $table->unique(['user_id', 'budget_category_id', 'period_type', 'period_start'], 'spending_patterns_unique');
            $table->index(['user_id', 'period_type', 'period_start']);
            $table->index(['budget_category_id', 'period_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spending_patterns');
    }
};
