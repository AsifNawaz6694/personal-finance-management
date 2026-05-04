<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpendingPattern extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'budget_category_id',
        'category_name',
        'period_type',
        'period_start',
        'period_end',
        'total_spent',
        'transaction_count',
        'average_transaction',
        'median_transaction',
        'min_transaction',
        'max_transaction',
        'std_deviation',
        'trend_percentage',
        'metadata',
    ];

    protected $casts = [
        'total_spent' => 'decimal:2',
        'average_transaction' => 'decimal:2',
        'median_transaction' => 'decimal:2',
        'min_transaction' => 'decimal:2',
        'max_transaction' => 'decimal:2',
        'std_deviation' => 'decimal:2',
        'trend_percentage' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'budget_category_id');
    }

    public function getTrendDirectionAttribute(): string
    {
        if ($this->trend_percentage === null) {
            return 'neutral';
        }
        
        return $this->trend_percentage > 0 ? 'increasing' : 'decreasing';
    }

    public function getTrendColorAttribute(): string
    {
        if ($this->trend_percentage === null) {
            return 'gray';
        }
        
        $absTrend = abs($this->trend_percentage);
        
        if ($absTrend >= 20) {
            return $this->trend_percentage > 0 ? 'red' : 'green';
        } elseif ($absTrend >= 10) {
            return $this->trend_percentage > 0 ? 'orange' : 'blue';
        } else {
            return 'gray';
        }
    }

    public function getFormattedTotalSpentAttribute(): string
    {
        // Default to PKR formatting
        return '₨ ' . number_format($this->total_spent, 2);
    }

    public function getFormattedAverageTransactionAttribute(): string
    {
        return '₨ ' . number_format($this->average_transaction, 2);
    }

    public function getIsAnomalousAttribute(): bool
    {
        if (!$this->std_deviation) {
            return false;
        }

        // Check if the current spending is more than 2 standard deviations from the mean
        $mean = $this->average_transaction;
        $threshold = $mean + (2 * $this->std_deviation);
        
        return $this->total_spent > $threshold;
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByPeriodType($query, $periodType)
    {
        return $query->where('period_type', $periodType);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->where('period_start', '>=', $startDate)
                    ->where('period_end', '<=', $endDate);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('budget_category_id', $categoryId);
    }

    public function scopeWithSignificantTrend($query, $threshold = 10)
    {
        return $query->whereNotNull('trend_percentage')
                    ->whereRaw('ABS(trend_percentage) >= ?', [$threshold]);
    }

    public function scopeAnomalous($query)
    {
        return $query->whereNotNull('std_deviation')
                    ->whereRaw('(total_spent - average_transaction) > (2 * std_deviation)');
    }
}
