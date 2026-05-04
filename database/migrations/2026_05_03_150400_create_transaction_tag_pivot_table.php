<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_transaction_tag', function (Blueprint $table) {
            $table->foreignId('budget_transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->primary(['budget_transaction_id', 'transaction_tag_id']);
            $table->index(['budget_transaction_id']);
            $table->index(['transaction_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_transaction_tag');
    }
};
