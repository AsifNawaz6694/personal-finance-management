<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('allocated_amount', 15, 2);
            $table->enum('type', ['income', 'expense']);
            $table->string('color')->nullable(); // For UI visualization
            $table->timestamps();

            $table->index(['budget_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_categories');
    }
};
