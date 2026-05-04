<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAuthenticatedMutations
{
    /**
     * @var list<string>
     */
    private const EXCLUDED_ROUTE_NAMES = [
        'login',
        'logout',
        'register',
        'two-factor.verify',
        'password.email',
        'password.store',
        'password.update',
        'verification.send',
        'invitation.accept',
        'sanctum.csrf-cookie',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! $request->user()) {
            return;
        }

        if ($response->getStatusCode() >= 400) {
            return;
        }

        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }

        $name = $request->route()?->getName();

        if ($name !== null && (
            in_array($name, self::EXCLUDED_ROUTE_NAMES, true)
            || str_starts_with($name, 'invitation.')
            || str_starts_with($name, 'broadcasting.')
            || str_starts_with($name, 'users.')
            || str_starts_with($name, 'api-tokens.')
        )) {
            return;
        }

        activity()
            ->useLog('http')
            ->causedBy($request->user())
            ->withProperties([
                'http_method' => $request->method(),
                'route' => $name,
                'path' => $request->path(),
                'status' => $response->getStatusCode(),
            ])
            ->log('HTTP '.$request->method().' '.$request->path());
    }
}
