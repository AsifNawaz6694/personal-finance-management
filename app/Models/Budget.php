<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'custom_type',
        'target_amount',
        'currency',
        'budget_year',
        'budget_month',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'budget_year' => 'integer',
        'budget_month' => 'integer',
    ];

    /**
     * Append computed accessors so they land in JSON payloads sent to the frontend.
     */
    protected $appends = [
        'total_income',
        'total_expenses',
        'remaining_balance',
        'budget_utilization',
        'formatted_target_amount',
        'formatted_total_income',
        'formatted_total_expenses',
        'formatted_remaining_balance',
        'budget_period',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(BudgetCategory::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BudgetTransaction::class);
    }

    public function incomeCategories(): HasMany
    {
        return $this->categories()->where('type', 'income');
    }

    public function expenseCategories(): HasMany
    {
        return $this->categories()->where('type', 'expense');
    }

    public function incomeTransactions(): HasMany
    {
        return $this->transactions()->where('type', 'income');
    }

    public function expenseTransactions(): HasMany
    {
        return $this->transactions()->where('type', 'expense');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(BudgetShare::class);
    }

    public function recurringTransactions(): HasMany
    {
        return $this->hasMany(RecurringTransaction::class);
    }

    public function sharedWith(): HasManyThrough
    {
        return $this->hasManyThrough(
            User::class,
            BudgetShare::class,
            'budget_id',
            'user_id',
            'id',
            'user_id'
        );
    }

    // Calculated properties
    public function getTotalIncomeAttribute(): float
    {
        return $this->incomeTransactions()->sum('amount');
    }

    public function getTotalExpensesAttribute(): float
    {
        return $this->expenseTransactions()->sum('amount');
    }

    public function getRemainingBalanceAttribute(): float
    {
        return $this->total_income - $this->total_expenses;
    }

    public function getBudgetUtilizationAttribute(): float
    {
        if ($this->target_amount == 0) {
            return 0;
        }

        return ($this->total_expenses / $this->target_amount) * 100;
    }

    public function getFormattedTargetAmountAttribute(): string
    {
        return $this->formatCurrency($this->target_amount);
    }

    public function getFormattedTotalIncomeAttribute(): string
    {
        return $this->formatCurrency($this->total_income);
    }

    public function getFormattedTotalExpensesAttribute(): string
    {
        return $this->formatCurrency($this->total_expenses);
    }

    public function getFormattedRemainingBalanceAttribute(): string
    {
        return $this->formatCurrency($this->remaining_balance);
    }

    private function formatCurrency(float $amount): string
    {
        $symbol = $this->currency === 'PKR' ? '₨' : '﷼';
        $formatted = number_format($amount, 2);
        
        return $symbol . ' ' . $formatted;
    }

    public function getBudgetPeriodAttribute(): string
    {
        $monthName = date('F', mktime(0, 0, 0, $this->budget_month, 1));
        return $monthName . ' ' . $this->budget_year;
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForYear($query, $year)
    {
        return $query->where('budget_year', $year);
    }

    public function scopeForMonth($query, $month)
    {
        return $query->where('budget_month', $month);
    }

    public function scopeForCurrency($query, $currency)
    {
        return $query->where('currency', $currency);
    }
}
