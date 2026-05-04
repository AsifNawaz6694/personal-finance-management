<?php

use App\Http\Controllers\Web\Onboarding\OnboardingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| First-time profile onboarding (authenticated, before shell features)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'edit'])->name('onboarding.edit');
    Route::post('onboarding', [OnboardingController::class, 'update'])->name('onboarding.update');
});
