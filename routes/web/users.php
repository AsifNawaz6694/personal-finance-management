<?php

use App\Http\Controllers\Web\Users\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User management (RBAC: pfm.identity.*)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
});
