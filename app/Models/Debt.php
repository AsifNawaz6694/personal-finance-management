<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'principal_amount',
        'interest_rate',
        'interest_type',
        'current_balance',
        'monthly_payment',
        'start_date',
        'due_date',
        'status',
        'lender',
        'account_number',
        'metadata',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'interest_rate' => 'decimal:4',
        'current_balance' => 'decimal:2',
        'monthly_payment' => 'decimal:2',
        'start_date' => 'date',
        'due_date' => 'date',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(DebtRepayment::class);
    }

    // Calculated properties
    public function getTotalPaidAttribute(): float
    {
        return $this->repayments()->where('status', 'paid')->sum('amount');
    }

    public function getTotalInterestPaidAttribute(): float
    {
        return $this->repayments()->where('status', 'paid')->sum('interest_amount');
    }

    public function getTotalPrincipalPaidAttribute(): float
    {
        return $this->repayments()->where('status', 'paid')->sum('principal_amount');
    }

    public function getRemainingBalanceAttribute(): float
    {
        return $this->current_balance;
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->principal_amount == 0) {
            return 0;
        }

        $paidPrincipal = $this->total_principal_paid;
        return ($paidPrincipal / $this->principal_amount) * 100;
    }

    public function getMonthlyInterestAttribute(): float
    {
        return $this->current_balance * ($this->interest_rate / 12 / 100);
    }

    public function getEstimatedPayoffDateAttribute(): ?\Carbon\Carbon
    {
        if ($this->monthly_payment <= 0 || $this->current_balance <= 0) {
            return null;
        }

        $monthlyRate = $this->interest_rate / 12 / 100;
        $balance = $this->current_balance;
        $payment = $this->monthly_payment;
        $months = 0;

        while ($balance > 0.01 && $months < 1200) { // Max 100 years to prevent infinite loop
            $interest = $balance * $monthlyRate;
            $principal = $payment - $interest;
            
            if ($principal <= 0) {
                break; // Payment doesn't cover interest
            }
            
            $balance -= $principal;
            $months++;
        }

        return now()->addMonths($months);
    }

    public function getFormattedPrincipalAmountAttribute(): string
    {
        return $this->formatCurrency($this->principal_amount);
    }

    public function getFormattedCurrentBalanceAttribute(): string
    {
        return $this->formatCurrency($this->current_balance);
    }

    public function getFormattedMonthlyPaymentAttribute(): string
    {
        return $this->monthly_payment ? $this->formatCurrency($this->monthly_payment) : 'N/A';
    }

    public function getFormattedTotalPaidAttribute(): string
    {
        return $this->formatCurrency($this->total_paid);
    }

    public function getFormattedRemainingBalanceAttribute(): string
    {
        return $this->formatCurrency($this->remaining_balance);
    }

    private function formatCurrency(float $amount): string
    {
        // Default to PKR for now, can be extended to support multiple currencies
        $symbol = '₨';
        $formatted = number_format($amount, 2);
        
        return $symbol . ' ' . $formatted;
    }

    public function getDaysPastDueAttribute(): int
    {
        if ($this->status !== 'active' || !$this->due_date) {
            return 0;
        }

        return now()->diffInDays(\Carbon\Carbon::parse($this->due_date));
    }

    public function getNextPaymentDateAttribute(): ?\Carbon\Carbon
    {
        if ($this->status !== 'active' || !$this->monthly_payment) {
            return null;
        }

        $lastPayment = $this->repayments()
            ->where('status', 'paid')
            ->orderBy('payment_date', 'desc')
            ->first();

        if ($lastPayment) {
            return \Carbon\Carbon::parse($lastPayment->payment_date)->addMonth();
        }

        return \Carbon\Carbon::parse($this->start_date)->addMonth();
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOverdue($query)
    {
        return $query->active()
                    ->where('due_date', '<', now());
    }
}
