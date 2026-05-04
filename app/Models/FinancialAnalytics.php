<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'budget_id',
        'type',
        'title',
        'description',
        'data',
        'severity',
        'status',
        'analysis_date',
        'period_start',
        'period_end',
        'recommendations',
    ];

    protected $casts = [
        'data' => 'array',
        'recommendations' => 'array',
        'analysis_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'info' => 'blue',
            'warning' => 'yellow',
            'critical' => 'red',
            default => 'gray',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'active' => 'green',
            'acknowledged' => 'blue',
            'dismissed' => 'gray',
            default => 'gray',
        };
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

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->where('period_start', '>=', $startDate)
                    ->where('period_end', '<=', $endDate);
    }

    public function acknowledge(): void
    {
        $this->update(['status' => 'acknowledged']);
    }

    public function dismiss(): void
    {
        $this->update(['status' => 'dismissed']);
    }
}
