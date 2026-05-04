<?php

namespace App\Http\Controllers\Web\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Onboarding\CompleteOnboardingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->mustCompleteOnboarding()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/edit', [
            'job_title' => $request->user()->job_title,
            'phone' => $request->user()->phone,
        ]);
    }

    public function update(CompleteOnboardingRequest $request): RedirectResponse
    {
        $request->user()->update([
            ...$request->validated(),
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('status', __('Welcome aboard — your profile is ready.'));
    }
}
