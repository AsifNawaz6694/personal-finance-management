<?php

namespace App\Http\Controllers\Web\Auth;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Auth\LoginRequest;
use App\Services\Auth\EmailTwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(LoginRequest $request, EmailTwoFactorService $twoFactor): RedirectResponse
    {
        $user = $request->validateCredentials();

        if ($user->account_status === AccountStatus::Suspended) {
            throw ValidationException::withMessages([
                'email' => __('This account has been suspended. Contact an administrator.'),
            ]);
        }

        if ($user->account_status === AccountStatus::PendingActivation) {
            throw ValidationException::withMessages([
                'email' => __('Your account is not active yet. Wait for an administrator to approve it.'),
            ]);
        }

        if ($user->two_factor_enabled) {
            $request->session()->put('two_factor_login.id', $user->id);
            $request->session()->put('two_factor_login.remember', $request->boolean('remember'));
            $twoFactor->sendLoginChallenge($user);

            return redirect()->route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
