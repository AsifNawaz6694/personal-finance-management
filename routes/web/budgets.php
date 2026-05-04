<?php

use App\Http\Controllers\Web\Budgets\BudgetController;
use App\Http\Controllers\Web\Budgets\BudgetCategoryController;
use App\Http\Controllers\Web\Budgets\BudgetTransactionController;
use App\Http\Controllers\Web\Budgets\BudgetShareController;
use App\Http\Controllers\Web\Budgets\DebtController;
use App\Http\Controllers\Web\Budgets\RecurringTransactionController;
use App\Http\Controllers\Web\Budgets\TransactionTagController;
use App\Http\Controllers\Web\Budgets\BudgetExportController;
use App\Http\Controllers\Web\Budgets\AnalyticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Budget Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets')->name('budgets.')->group(function () {
    // /budgets/dashboard now redirects to the unified /dashboard
    Route::redirect('/dashboard', '/dashboard')->name('dashboard');

    // Budget CRUD
    Route::get('/', [BudgetController::class, 'index'])->name('index');
    Route::get('/create', [BudgetController::class, 'create'])->name('create');
    Route::post('/', [BudgetController::class, 'store'])->name('store');
    Route::get('/{budget}', [BudgetController::class, 'show'])->whereNumber('budget')->name('show');
    Route::get('/{budget}/edit', [BudgetController::class, 'edit'])->whereNumber('budget')->name('edit');
    Route::put('/{budget}', [BudgetController::class, 'update'])->whereNumber('budget')->name('update');
    Route::delete('/{budget}', [BudgetController::class, 'destroy'])->whereNumber('budget')->name('destroy');

    // Budget Categories
    Route::prefix('/{budget}/categories')->name('categories.')->group(function () {
        Route::get('/', [BudgetCategoryController::class, 'index'])->name('index');
        Route::get('/create', [BudgetCategoryController::class, 'create'])->name('create');
        Route::post('/', [BudgetCategoryController::class, 'store'])->name('store');
        Route::get('/{category}', [BudgetCategoryController::class, 'show'])->name('show');
        Route::get('/{category}/edit', [BudgetCategoryController::class, 'edit'])->name('edit');
        Route::put('/{category}', [BudgetCategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [BudgetCategoryController::class, 'destroy'])->name('destroy');
    });

    // Budget Transactions
    Route::prefix('/{budget}/transactions')->name('transactions.')->group(function () {
        Route::get('/', [BudgetTransactionController::class, 'index'])->name('index');
        Route::get('/create', [BudgetTransactionController::class, 'create'])->name('create');
        Route::post('/', [BudgetTransactionController::class, 'store'])->name('store');
        Route::get('/{transaction}', [BudgetTransactionController::class, 'show'])->name('show');
        Route::get('/{transaction}/edit', [BudgetTransactionController::class, 'edit'])->name('edit');
        Route::put('/{transaction}', [BudgetTransactionController::class, 'update'])->name('update');
        Route::delete('/{transaction}', [BudgetTransactionController::class, 'destroy'])->name('destroy');
    });

    // Recurring Transactions
    Route::prefix('/{budget}/recurring-transactions')->name('recurring-transactions.')->group(function () {
        Route::get('/', [RecurringTransactionController::class, 'index'])->name('index');
        Route::get('/create', [RecurringTransactionController::class, 'create'])->name('create');
        Route::post('/', [RecurringTransactionController::class, 'store'])->name('store');
        Route::get('/{recurringTransaction}', [RecurringTransactionController::class, 'show'])->name('show');
        Route::get('/{recurringTransaction}/edit', [RecurringTransactionController::class, 'edit'])->name('edit');
        Route::put('/{recurringTransaction}', [RecurringTransactionController::class, 'update'])->name('update');
        Route::delete('/{recurringTransaction}', [RecurringTransactionController::class, 'destroy'])->name('destroy');
        Route::post('/{recurringTransaction}/process', [RecurringTransactionController::class, 'process'])->name('process');
    });

});

// Budget Sharing (global inbox — receive, accept/decline, send out invites)
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/shares')->name('budgets.shares.')->group(function () {
    Route::get('/', [BudgetShareController::class, 'index'])->name('index');
    Route::post('/', [BudgetShareController::class, 'store'])->name('store');
    Route::put('/{budgetShare}/accept', [BudgetShareController::class, 'accept'])->name('accept');
    Route::put('/{budgetShare}/decline', [BudgetShareController::class, 'decline'])->name('decline');
    Route::delete('/{budgetShare}', [BudgetShareController::class, 'destroy'])->name('destroy');
});

// Debts Management (separate from specific budgets)
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/debts')->name('budgets.debts.')->group(function () {
    Route::get('/', [DebtController::class, 'index'])->name('index');
    Route::get('/create', [DebtController::class, 'create'])->name('create');
    Route::post('/', [DebtController::class, 'store'])->name('store');
    Route::get('/{debt}', [DebtController::class, 'show'])->name('show');
    Route::get('/{debt}/edit', [DebtController::class, 'edit'])->name('edit');
    Route::put('/{debt}', [DebtController::class, 'update'])->name('update');
    Route::delete('/{debt}', [DebtController::class, 'destroy'])->name('destroy');
    Route::post('/{debt}/record-payment', [DebtController::class, 'recordPayment'])->name('record-payment');
    Route::get('/export/excel', [DebtController::class, 'exportExcel'])->name('export.excel');
    Route::get('/export/pdf', [DebtController::class, 'exportPDF'])->name('export.pdf');
});

// Recurring Transactions (cross-budget overview)
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/recurring-transactions')->name('budgets.recurring-transactions-overview.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Web\Budgets\RecurringTransactionController::class, 'overview'])->name('index');
});

// Transaction Tags Management
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/tags')->name('budgets.tags.')->group(function () {
    Route::get('/', [TransactionTagController::class, 'index'])->name('index');
    Route::post('/', [TransactionTagController::class, 'store'])->name('store');
    Route::put('/{tag}', [TransactionTagController::class, 'update'])->name('update');
    Route::delete('/{tag}', [TransactionTagController::class, 'destroy'])->name('destroy');
});

// Export Functionality
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/export')->name('budgets.export.')->group(function () {
    Route::get('/all-excel', [BudgetExportController::class, 'exportAllToExcel'])->name('all.excel');
    Route::get('/all-pdf', [BudgetExportController::class, 'exportAllToPDF'])->name('all.pdf');
    Route::get('/{budget}/excel', [BudgetExportController::class, 'exportBudgetToExcel'])->name('budget.excel');
    Route::get('/{budget}/pdf', [BudgetExportController::class, 'exportBudgetToPDF'])->name('budget.pdf');
});

// Analytics and Insights
Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('budgets/analytics')->name('budgets.analytics.')->group(function () {
    Route::get('/', [AnalyticsController::class, 'index'])->name('index');
    // Literal-prefix routes MUST be registered before /{analytics} so they don't get swallowed by model binding.
    Route::get('/spending-analysis', [AnalyticsController::class, 'spendingAnalysis'])->name('spending-analysis');
    Route::get('/monthly-comparison', [AnalyticsController::class, 'monthlyComparison'])->name('monthly-comparison');
    Route::get('/predictions', [AnalyticsController::class, 'predictions'])->name('predictions');
    Route::get('/notifications', [AnalyticsController::class, 'notifications'])->name('notifications');
    Route::put('/notifications/read-all', [AnalyticsController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::put('/notifications/{notification}/read', [AnalyticsController::class, 'markNotificationAsRead'])->whereNumber('notification')->name('notifications.read');
    Route::put('/notifications/{notification}/dismiss', [AnalyticsController::class, 'dismissNotification'])->whereNumber('notification')->name('notifications.dismiss');
    Route::get('/{analytics}', [AnalyticsController::class, 'show'])->whereNumber('analytics')->name('show');
    Route::put('/{analytics}/acknowledge', [AnalyticsController::class, 'acknowledge'])->whereNumber('analytics')->name('acknowledge');
    Route::put('/{analytics}/dismiss', [AnalyticsController::class, 'dismiss'])->whereNumber('analytics')->name('dismiss');
});
