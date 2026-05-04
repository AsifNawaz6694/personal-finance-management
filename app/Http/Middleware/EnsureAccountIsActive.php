<?php

namespace App\Http\Middleware;

use App\Enums\AccountStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        if ($user->account_status === AccountStatus::Suspended) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => __('This account has been suspended.'),
            ]);
        }

        if ($user->account_status === AccountStatus::PendingActivation) {
            if ($request->routeIs('onboarding.*', 'activation.pending', 'logout', 'verification.*')) {
                return $next($request);
            }

            return redirect()->route('activation.pending');
        }

        return $next($request);
    }
}
