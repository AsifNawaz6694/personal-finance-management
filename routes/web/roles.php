<?php

use App\Http\Controllers\Web\Roles\PermissionController;
use App\Http\Controllers\Web\Roles\RoleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Roles & Permissions Management
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('index');
    Route::get('/create', [RoleController::class, 'create'])->name('create')->middleware('permission:pfm.security.roles.sync');
    Route::post('/', [RoleController::class, 'store'])->name('store')->middleware('permission:pfm.security.roles.sync');
    Route::get('/{role}', [RoleController::class, 'show'])->name('show');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit')->middleware('permission:pfm.security.roles.sync');
    Route::put('/{role}', [RoleController::class, 'update'])->name('update')->middleware('permission:pfm.security.roles.sync');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy')->middleware('permission:pfm.security.roles.sync');
});

Route::middleware(['auth', 'account.active', 'profile.onboarded'])->prefix('permissions')->name('permissions.')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('index');
    Route::get('/{permission}', [PermissionController::class, 'show'])->name('show');
});
