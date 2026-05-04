<?php

use App\Http\Controllers\Web\Activity\ActivityLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Activity & audit center
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->group(function () {
    Route::get('activity', [ActivityLogController::class, 'index'])->name('activity.index');
});
