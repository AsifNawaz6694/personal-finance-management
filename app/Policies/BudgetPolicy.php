<?php

namespace App\Policies;

use App\Models\Budget;
use App\Models\BudgetShare;
use App\Models\User;

class BudgetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Budget $budget): bool
    {
        if ($budget->user_id === $user->id) {
            return true;
        }
        return BudgetShare::query()
            ->where('budget_id', $budget->id)
            ->where('user_id', $user->id)
            ->where('status', 'accepted')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function update(User $user, Budget $budget): bool
    {
        if ($budget->user_id === $user->id) {
            return true;
        }
        return BudgetShare::query()
            ->where('budget_id', $budget->id)
            ->where('user_id', $user->id)
            ->where('status', 'accepted')
            ->where('permission', 'edit')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function delete(User $user, Budget $budget): bool
    {
        return $budget->user_id === $user->id;
    }
}
