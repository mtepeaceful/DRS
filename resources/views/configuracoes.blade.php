@extends('layouts.app')

@section('title', 'Configurações - Projetin')

@section('content')
<div class="settings-empty-state d-flex flex-column justify-content-center align-items-center" style="min-height: 80vh; text-align: center;">
    <div>
        <h2 class="mb-5" style="font-family: 'Orbitron', sans-serif; font-weight: 700; color: white;">motores aquecendo por aqui...</h2>
        
        <div class="mb-5">
            <img src="{{ asset('images/f1_drift.png') }}" alt="F1 Drifting Illustration" class="img-fluid" style="max-width: 245px; width: 100%;">
        </div>
        
        <a href="{{ route('home-site') }}" class="btn btn-racing px-5 py-2" style="font-size: 1.1rem; border-radius: 4px;">
            VOLTAR AO DASHBOARD
        </a>
    </div>
</div>
@endsection
