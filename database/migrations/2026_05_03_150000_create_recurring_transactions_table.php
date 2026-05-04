<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['income', 'expense']);
            $table->enum('interval', ['weekly', 'monthly', 'yearly']);
            $table->tinyInteger('day_of_month')->nullable(); // For monthly (1-31)
            $table->string('day_of_week')->nullable(); // For weekly ('monday', 'tuesday', etc.)
            $table->tinyInteger('month_of_year')->nullable(); // For yearly (1-12)
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Optional end date
            $table->enum('status', ['active', 'paused', 'completed', 'cancelled'])->default('active');
            $table->timestamp('last_processed_at')->nullable();
            $table->timestamp('next_process_at')->nullable();
            $table->integer('process_count')->default(0); // How many times it has been processed
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['budget_id', 'status']);
            $table->index(['next_process_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
