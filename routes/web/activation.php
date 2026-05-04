<?php

use App\Http\Controllers\Web\Activation\ActivationPendingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Accounts waiting for administrator activation
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active'])->group(function () {
    Route::get('activation/pending', [ActivationPendingController::class, 'show'])->name('activation.pending');
});
