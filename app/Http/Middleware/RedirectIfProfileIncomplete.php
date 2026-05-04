<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfProfileIncomplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->mustCompleteOnboarding() && ! $request->routeIs('onboarding.*', 'logout', 'verification.*')) {
            return redirect()->route('onboarding.edit');
        }

        return $next($request);
    }
}
