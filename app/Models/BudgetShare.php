<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'user_id',
        'shared_by',
        'permission',
        'accepted_at',
        'expires_at',
        'message',
        'status',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by');
    }

    public function getPermissionLabelAttribute(): string
    {
        return ucfirst($this->permission);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Acceptance',
            'accepted' => 'Accepted',
            'declined' => 'Declined',
            'expired' => 'Expired',
            default => ucfirst($this->status),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'accepted' => 'green',
            'declined' => 'red',
            'expired' => 'gray',
            default => 'gray',
        };
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    public function getCanEditAttribute(): bool
    {
        return $this->permission === 'edit' && $this->status === 'accepted' && !$this->is_expired;
    }

    public function getCanViewAttribute(): bool
    {
        return $this->status === 'accepted' && !$this->is_expired;
    }

    public function scopeForBudget($query, $budgetId)
    {
        return $query->where('budget_id', $budgetId);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSharedBy($query, $userId)
    {
        return $query->where('shared_by', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'accepted')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                    ->orWhere(function ($q) {
                        $q->where('expires_at', '<=', now());
                    });
    }

    public function accept(): void
    {
        $this->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    public function decline(): void
    {
        $this->update([
            'status' => 'declined',
        ]);
    }

    public function revoke(): void
    {
        $this->update([
            'status' => 'expired',
        ]);
    }
}
