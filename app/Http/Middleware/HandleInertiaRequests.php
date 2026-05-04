<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $this->formatUser($request->user()),
            ],
            'notifications' => fn () => $request->user()
                ? [
                    'unread' => \App\Models\Notification::query()
                        ->where('user_id', $request->user()->id)
                        ->where('status', 'unread')
                        ->count(),
                ]
                : ['unread' => 0],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function formatUser(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        $user->loadMissing(['roles']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'account_status' => $user->account_status->value,
            'onboarding_completed_at' => $user->onboarding_completed_at,
            'two_factor_enabled' => $user->two_factor_enabled,
            'phone' => $user->phone,
            'job_title' => $user->job_title,
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }
}
