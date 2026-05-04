<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debt_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->decimal('principal_amount', 15, 2); // Portion that goes to principal
            $table->decimal('interest_amount', 15, 2); // Portion that goes to interest
            $table->date('payment_date');
            $table->enum('status', ['scheduled', 'paid', 'late', 'missed'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['debt_id', 'payment_date']);
            $table->index(['status', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_repayments');
    }
};
