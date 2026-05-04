<?php

namespace App\Http\Controllers\Web\Activation;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivationPendingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->mustCompleteOnboarding()) {
            return redirect()->route('onboarding.edit');
        }

        return Inertia::render('activation/pending');
    }
}
