<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['loan', 'credit_card', 'mortgage', 'personal', 'other']);
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 8, 4); // Annual interest rate (e.g., 12.5% = 0.1250)
            $table->enum('interest_type', ['simple', 'compound']);
            $table->decimal('current_balance', 15, 2);
            $table->decimal('monthly_payment', 15, 2)->nullable();
            $table->date('start_date');
            $table->date('due_date')->nullable(); // Final due date
            $table->enum('status', ['active', 'paid_off', 'defaulted', 'restructured'])->default('active');
            $table->string('lender')->nullable(); // Bank, institution, person
            $table->string('account_number')->nullable(); // Loan or credit card number
            $table->json('metadata')->nullable(); // Additional terms, conditions, etc.
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
