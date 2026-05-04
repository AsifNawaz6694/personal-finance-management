<?php

use App\Http\Controllers\Web\Invitations\UserInvitationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Email invitations (authenticated)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->group(function () {
    Route::get('users/invitations/create', [UserInvitationController::class, 'create'])->name('users.invitations.create');
    Route::post('users/invitations', [UserInvitationController::class, 'store'])->name('users.invitations.store');
});
