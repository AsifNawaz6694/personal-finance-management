<?php

namespace App\Http\Controllers\Web\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\EmailTwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('two_factor_login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/two-factor-challenge', [
            'email' => User::query()->find($request->session()->get('two_factor_login.id'))?->email,
        ]);
    }

    public function store(Request $request, EmailTwoFactorService $twoFactor): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]+$/'],
        ]);

        $userId = $request->session()->get('two_factor_login.id');
        $user = User::query()->findOrFail($userId);

        $twoFactor->verifyLoginChallenge($user, $request->string('code')->toString());

        $remember = (bool) $request->session()->pull('two_factor_login.remember', false);
        $request->session()->forget('two_factor_login.id');

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
