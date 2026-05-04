<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'budget_id',
        'budget_category_id',
        'title',
        'description',
        'amount',
        'type',
        'interval',
        'day_of_month',
        'day_of_week',
        'month_of_year',
        'start_date',
        'end_date',
        'status',
        'last_processed_at',
        'next_process_at',
        'process_count',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'last_processed_at' => 'datetime',
        'next_process_at' => 'datetime',
        'process_count' => 'integer',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'budget_category_id');
    }

    public function getFormattedAmountAttribute(): string
    {
        return $this->budget->formatCurrency($this->amount);
    }

    public function getNextOccurrenceAttribute(): ?\Carbon\Carbon
    {
        if ($this->status !== 'active') {
            return null;
        }

        $nextDate = match ($this->interval) {
            'weekly' => $this->calculateNextWeekly(),
            'monthly' => $this->calculateNextMonthly(),
            'yearly' => $this->calculateNextYearly(),
            default => null,
        };

        // Check if next occurrence is after end date
        if ($this->end_date && $nextDate && $nextDate->greaterThan($this->end_date)) {
            return null;
        }

        return $nextDate;
    }

    private function calculateNextWeekly(): \Carbon\Carbon
    {
        $lastProcessed = $this->last_processed_at ? 
            \Carbon\Carbon::parse($this->last_processed_at) : 
            \Carbon\Carbon::parse($this->start_date)->subWeek();

        return $lastProcessed->next($this->day_of_week ?: 'monday');
    }

    private function calculateNextMonthly(): \Carbon\Carbon
    {
        $lastProcessed = $this->last_processed_at ? 
            \Carbon\Carbon::parse($this->last_processed_at) : 
            \Carbon\Carbon::parse($this->start_date)->subMonth();

        $day = $this->day_of_month ?: $lastProcessed->day;
        
        return $lastProcessed->addMonth()->day(min($day, $lastProcessed->daysInMonth));
    }

    private function calculateNextYearly(): \Carbon\Carbon
    {
        $lastProcessed = $this->last_processed_at ? 
            \Carbon\Carbon::parse($this->last_processed_at) : 
            \Carbon\Carbon::parse($this->start_date)->subYear();

        $month = $this->month_of_year ?: $lastProcessed->month;
        $day = min($this->day_of_month ?: $lastProcessed->day, 28); // Use 28 to avoid invalid dates
        
        return $lastProcessed->addYear()->month($month)->day($day);
    }

    public function generateTransaction(): BudgetTransaction
    {
        return new BudgetTransaction([
            'budget_id' => $this->budget_id,
            'budget_category_id' => $this->budget_category_id,
            'description' => $this->title,
            'amount' => $this->amount,
            'type' => $this->type,
            'transaction_date' => $this->next_process_at?->toDateString() ?? now()->toDateString(),
            'notes' => $this->description,
            'metadata' => array_merge($this->metadata ?? [], [
                'recurring_transaction_id' => $this->id,
                'auto_generated' => true,
            ]),
        ]);
    }

    public function markAsProcessed(): void
    {
        $this->update([
            'last_processed_at' => now(),
            'next_process_at' => $this->getNextOccurrence(),
            'process_count' => $this->process_count + 1,
        ]);

        // Check if recurring transaction should be completed
        if ($this->end_date && now()->greaterThanOrEqualTo($this->end_date)) {
            $this->update(['status' => 'completed']);
        }
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDueForProcessing($query)
    {
        return $query->active()
                    ->where('next_process_at', '<=', now());
    }

    public function scopeByInterval($query, $interval)
    {
        return $query->where('interval', $interval);
    }
}
