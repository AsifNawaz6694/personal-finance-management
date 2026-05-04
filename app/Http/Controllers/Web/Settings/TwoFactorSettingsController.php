<?php

namespace App\Http\Controllers\Web\Settings;

use App\Http\Controllers\Controller;
use App\Services\Auth\EmailTwoFactorService;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/two-factor', [
            'enabled' => $request->user()->two_factor_enabled,
        ]);
    }

    public function sendEnableCode(Request $request, EmailTwoFactorService $twoFactor): RedirectResponse
    {
        if ($request->user()->two_factor_enabled) {
            return back()->with('status', __('Two-factor authentication is already enabled.'));
        }

        $twoFactor->sendSetupChallenge($request->user());

        return back()->with('status', __('We emailed you a verification code.'));
    }

    public function confirmEnable(Request $request, EmailTwoFactorService $twoFactor): RedirectResponse
    {
        if ($request->user()->two_factor_enabled) {
            return redirect()->route('two-factor.edit');
        }

        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]+$/'],
        ]);

        $twoFactor->verifySetupChallenge($request->user(), $request->string('code')->toString());

        $request->user()->update(['two_factor_enabled' => true]);

        ActivityLogger::log('Two-factor email authentication enabled', $request->user(), [], $request->user(), 'security');

        return redirect()->route('two-factor.edit')->with('status', __('Email two-factor authentication is now on.'));
    }

    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        if (! $request->user()->two_factor_enabled) {
            return redirect()->route('two-factor.edit');
        }

        $request->user()->update(['two_factor_enabled' => false]);

        ActivityLogger::log('Two-factor email authentication disabled', $request->user(), [], $request->user(), 'security');

        return redirect()->route('two-factor.edit')->with('status', __('Two-factor authentication has been turned off.'));
    }
}
