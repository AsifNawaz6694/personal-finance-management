<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public web routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');
