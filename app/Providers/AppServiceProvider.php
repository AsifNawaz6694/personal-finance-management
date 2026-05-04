<?php

namespace App\Providers;

use App\Models\Budget;
use App\Models\Debt;
use App\Models\User;
use App\Observers\UserObserver;
use App\Policies\BudgetPolicy;
use App\Policies\DebtPolicy;
use App\Support\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        User::observe(UserObserver::class);

        Gate::policy(Budget::class, BudgetPolicy::class);
        Gate::policy(Debt::class, DebtPolicy::class);

        // Super-admins bypass all policy checks.
        Gate::before(function (User $user) {
            if ($user->hasRole('super-admin')) {
                return true;
            }
            return null;
        });

        Event::listen(Login::class, function (Login $event): void {
            ActivityLogger::log(
                'User signed in',
                $event->user,
                ['remember' => $event->remember],
                $event->user,
                'auth',
            );
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user !== null) {
                ActivityLogger::log('User signed out', $event->user, [], $event->user, 'auth');
            }
        });

        Event::listen(Failed::class, function (Failed $event): void {
            ActivityLogger::log(
                'Failed sign-in attempt',
                null,
                ['email' => $event->credentials['email'] ?? null, 'guard' => $event->guard],
                null,
                'auth',
            );
        });
    }
}
