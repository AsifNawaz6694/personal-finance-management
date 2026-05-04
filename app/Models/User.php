<?php

namespace App\Models;

use App\Enums\AccountStatus;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmailContract
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'account_status',
        'onboarding_completed_at',
        'two_factor_enabled',
        'phone',
        'job_title',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'account_status' => AccountStatus::class,
            'onboarding_completed_at' => 'datetime',
            'two_factor_enabled' => 'boolean',
        ];
    }

    public function mustCompleteOnboarding(): bool
    {
        return $this->onboarding_completed_at === null;
    }

    public function budgets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function debts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Debt::class);
    }

    public function recurringTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RecurringTransaction::class);
    }

    public function transactionTags(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TransactionTag::class);
    }
}
