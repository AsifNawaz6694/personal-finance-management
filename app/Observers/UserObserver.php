<?php

namespace App\Observers;

use App\Models\User;
use App\Support\ActivityLogger;

class UserObserver
{
    public function created(User $user): void
    {
        ActivityLogger::log(
            'User account created',
            $user,
            ['account_status' => $user->account_status->value],
            auth()->user(),
            'audit',
        );
    }

    public function updated(User $user): void
    {
        if ($user->wasChanged('account_status')) {
            ActivityLogger::log(
                'User account status changed',
                $user,
                [
                    'from' => $user->getOriginal('account_status'),
                    'to' => $user->account_status->value,
                ],
                auth()->user(),
                'audit',
            );

            return;
        }

        $watched = ['name', 'email', 'phone', 'job_title'];
        $changes = collect($user->getChanges())->only($watched);
        if ($changes->isNotEmpty()) {
            ActivityLogger::log(
                'User profile updated',
                $user,
                ['changes' => $changes->all()],
                auth()->user(),
                'audit',
            );
        }
    }

    public function deleted(User $user): void
    {
        ActivityLogger::log(
            'User account deleted',
            null,
            [
                'deleted_user_id' => $user->id,
                'email' => $user->email,
            ],
            auth()->user(),
            'audit',
        );
    }
}
