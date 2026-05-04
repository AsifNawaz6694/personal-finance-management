<?php

use App\Http\Controllers\Web\Budgets\BudgetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authenticated application shell (Inertia pages)
|--------------------------------------------------------------------------
| /dashboard is now the Budget Dashboard. The old workspace-stats dashboard
| has been removed in favour of a single, finance-first home page.
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->group(function () {
    Route::get('dashboard', [BudgetController::class, 'dashboard'])->name('dashboard');
});
