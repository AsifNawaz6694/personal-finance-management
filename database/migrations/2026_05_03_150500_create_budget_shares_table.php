<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The user being shared with
            $table->foreignId('shared_by')->constrained('users')->onDelete('cascade'); // The owner who shared it
            $table->enum('permission', ['view', 'edit'])->default('view');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('message')->nullable(); // Personal message from the owner
            $table->enum('status', ['pending', 'accepted', 'declined', 'expired'])->default('pending');
            $table->timestamps();

            $table->unique(['budget_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['shared_by']);
            $table->index(['expires_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_shares');
    }
};
