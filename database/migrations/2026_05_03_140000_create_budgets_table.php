<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['personal', 'household', 'travel', 'custom']);
            $table->string('custom_type')->nullable();
            $table->decimal('target_amount', 15, 2);
            $table->enum('currency', ['PKR', 'SAR']);
            $table->year('budget_year');
            $table->tinyInteger('budget_month'); // 1-12
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->timestamps();

            $table->index(['user_id', 'budget_year', 'budget_month']);
            $table->index(['currency', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
