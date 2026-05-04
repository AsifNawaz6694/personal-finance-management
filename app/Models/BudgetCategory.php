<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'name',
        'description',
        'allocated_amount',
        'type',
        'color',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BudgetTransaction::class);
    }

    public function getSpentAmountAttribute(): float
    {
        return $this->transactions()->sum('amount');
    }

    public function getRemainingAmountAttribute(): float
    {
        if ($this->type === 'expense') {
            return $this->allocated_amount - $this->spent_amount;
        }
        
        // For income categories, remaining is the amount not yet received
        return $this->allocated_amount - $this->spent_amount;
    }

    public function getUtilizationPercentageAttribute(): float
    {
        if ($this->allocated_amount == 0) {
            return 0;
        }

        return ($this->spent_amount / $this->allocated_amount) * 100;
    }

    public function getFormattedAllocatedAmountAttribute(): string
    {
        return $this->budget->formatCurrency($this->allocated_amount);
    }

    public function getFormattedSpentAmountAttribute(): string
    {
        return $this->budget->formatCurrency($this->spent_amount);
    }

    public function getFormattedRemainingAmountAttribute(): string
    {
        return $this->budget->formatCurrency($this->remaining_amount);
    }

    public function scopeForBudget($query, $budgetId)
    {
        return $query->where('budget_id', $budgetId);
    }

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }
}
