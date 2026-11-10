@php
    use App\DesignPatterns\Factory\PilotoFactory;

    $piloto = null;
    $pesquisou = false;

    if (request()->isMethod('post')) {
        $pesquisou = true;
        $piloto = PilotoFactory::getPiloto(request()->input('busca_nome'));
    }
@endphp

@extends('layouts.app')

@section('title', 'Busca Factory - Projetin v1')

@push('styles')
<style>
    .form-container {
        background: rgba(18, 18, 18, 0.9);
        padding: 40px;
        border-radius: 4px;
        border: 1px solid rgba(157, 80, 187, 0.4);
        box-shadow: 0 0 25px rgba(157, 80, 187, 0.15);
    }

    .form-label {
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--primary-racing);
        font-size: 0.85rem;
    }

    .form-control {
        background: rgba(10, 10, 10, 0.8) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        padding: 14px 20px !important;
        border-radius: 4px !important;
        font-weight: 500;
    }

    .form-control[readonly] {
        background: rgba(5, 5, 5, 0.9) !important;
        opacity: 0.8;
    }

    .btn-salvar {
        background: var(--primary-racing) !important;
        border: 1px solid var(--neon-purple) !important;
        padding: 16px !important;
        font-weight: 700 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: white !important;
        box-shadow: 0 0 15px rgba(255, 24, 1, 0.2);
    }

    .btn-salvar:hover {
        background: var(--primary-hover) !important;
        box-shadow: 0 0 25px rgba(157, 80, 187, 0.4);
        transform: translateY(-2px);
    }
</style>
@endpush

@section('content')
<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
    <h1 class="h2">Busca de Piloto (Factory Pattern)</h1>
</div>

<div class="col-md-8 mx-auto">
    
    @if($pesquisou && !$piloto)
        <div class="alert alert-warning border-0" style="background: rgba(255, 193, 7, 0.1); color: #ffc107;">
            Nenhum piloto encontrado com esse nome. Campos zerados.
        </div>
    @endif

    <div class="form-container">
        <form action="{{ route('busca-factory') }}" method="post">
            @csrf
            
            <div class="mb-4">
                <label class="form-label" style="color: var(--neon-purple);">Buscar por Nome</label>
                <div class="input-group">
                    <input type="text" name="busca_nome" class="form-control" placeholder="Ex: Lewis Hamilton" value="{{ request('busca_nome') }}" required>
                    <button class="btn btn-racing" type="submit">
                        <i class="bi bi-search"></i> Buscar
                    </button>
                </div>
                <small class="text-muted mt-2 d-block">Tente: Kimi Antonelli, Charles Leclerc, Max Verstappen, Lewis Hamilton</small>
            </div>

            <hr class="border-secondary my-4">

            <div class="mb-3">
                <label class="form-label">Nome Completo</label>
                <input type="text" class="form-control" value="{{ $piloto ? $piloto->nomeCompleto : '' }}" readonly>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Equipe</label>
                    <input type="text" class="form-control" value="{{ $piloto ? $piloto->equipe : '' }}" readonly>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Nacionalidade</label>
                    <input type="text" class="form-control" value="{{ $piloto ? $piloto->nacionalidade : '' }}" readonly>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Número</label>
                    <input type="text" class="form-control" value="{{ $piloto ? $piloto->numero : '' }}" readonly>
                </div>
                <div class="col-md-6 mb-4">
                    <label class="form-label">Títulos Mundiais</label>
                    <input type="text" class="form-control" value="{{ $piloto ? $piloto->titulosMundiais : '' }}" readonly>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
