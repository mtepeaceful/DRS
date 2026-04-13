<?php

use App\Http\Controllers\PilotoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home-site');

Route::get('/configuracoes', function () {
    return view('configuracoes');
})->name('configuracoes');

Route::resource('pilotos', PilotoController::class);

Route::match(['get', 'post'], '/busca-factory', function () {
    return view('pilotos.busca-factory');
})->name('busca-factory');
