<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebtRepayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'debt_id',
        'budget_transaction_id',
        'amount',
        'principal_amount',
        'interest_amount',
        'payment_date',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'principal_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'payment_date' => 'date',
        'metadata' => 'array',
    ];

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(BudgetTransaction::class, 'budget_transaction_id');
    }

    public function getFormattedAmountAttribute(): string
    {
        return $this->debt->formatCurrency($this->amount);
    }

    public function getFormattedPrincipalAmountAttribute(): string
    {
        return $this->debt->formatCurrency($this->principal_amount);
    }

    public function getFormattedInterestAmountAttribute(): string
    {
        return $this->debt->formatCurrency($this->interest_amount);
    }

    public function scopeForDebt($query, $debtId)
    {
        return $query->where('debt_id', $debtId);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    public function scopeMissed($query)
    {
        return $query->where('status', 'missed');
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }
}
