<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('related_id')->nullable(); // For related entities like transactions, debts, etc.
            $table->string('related_type')->nullable();
            $table->enum('type', [
                'overspending_alert',
                'budget_limit_warning',
                'upcoming_recurring_payment',
                'unusual_spending',
                'budget_shortfall',
                'debt_payment_reminder',
                'savings_opportunity',
                'monthly_summary',
                'insight_generated'
            ]);
            $table->string('title');
            $table->text('message');
            $table->json('metadata')->nullable(); // Additional data for the notification
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'sent', 'read', 'dismissed'])->default('pending');
            $table->timestamp('scheduled_at')->nullable(); // For scheduled notifications
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'priority']);
            $table->index(['type', 'scheduled_at']);
            $table->index(['budget_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
