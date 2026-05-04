<?php

use App\Http\Controllers\Web\Invitations\AcceptInvitationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Accept invitation (public link from email)
|--------------------------------------------------------------------------
*/

Route::get('invitation/{token}', [AcceptInvitationController::class, 'show'])->name('invitation.show');
Route::post('invitation/{token}', [AcceptInvitationController::class, 'store'])->name('invitation.accept');
