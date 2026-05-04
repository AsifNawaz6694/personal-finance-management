<?php

use App\Http\Controllers\Web\Settings\ApiTokenController;
use App\Http\Controllers\Web\Settings\AppearanceController;
use App\Http\Controllers\Web\Settings\PasswordController;
use App\Http\Controllers\Web\Settings\ProfileController;
use App\Http\Controllers\Web\Settings\TwoFactorSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User settings (authenticated + onboarding complete)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('appearance');

    Route::get('settings/two-factor', [TwoFactorSettingsController::class, 'edit'])->name('two-factor.edit');
    Route::post('settings/two-factor/enable-request', [TwoFactorSettingsController::class, 'sendEnableCode'])
        ->name('two-factor.enable-request');
    Route::post('settings/two-factor/enable-confirm', [TwoFactorSettingsController::class, 'confirmEnable'])
        ->name('two-factor.enable-confirm');
    Route::post('settings/two-factor/disable', [TwoFactorSettingsController::class, 'disable'])
        ->name('two-factor.disable');

    Route::get('settings/api-tokens', [ApiTokenController::class, 'edit'])->name('api-tokens.edit');
    Route::post('settings/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('settings/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');
});
