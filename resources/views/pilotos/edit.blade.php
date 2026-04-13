@extends('layouts.app')

@section('title', 'Edição de Piloto')

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
    <h1 class="h2">Edição de Piloto</h1>
</div>

<div class="col-md-8 mx-auto">
    <div class="form-container">
        <form action="{{ route('pilotos.update', $piloto->id) }}" method="post">
            @csrf
            @method('PUT')
            <div class="mb-3">
                <label class="form-label">Nome Completo</label>
                <input type="text" name="nome" class="form-control" value="{{ $piloto->nome }}" required>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Equipe</label>
                    <input type="text" name="equipe" class="form-control" value="{{ $piloto->equipe }}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Nacionalidade</label>
                    <input type="text" name="nacionalidade" class="form-control" value="{{ $piloto->nacionalidade }}" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Número</label>
                    <input type="number" name="numero" class="form-control" value="{{ $piloto->numero }}" required>
                </div>
                <div class="col-md-6 mb-4">
                    <label class="form-label">Títulos Mundiais</label>
                    <input type="number" name="titulos" class="form-control" value="{{ $piloto->titulos }}" min="0">
                </div>
            </div>

            <div class="d-grid shadow-sm">
                <button type="submit" class="btn btn-primary btn-salvar">
                    <i class="bi bi-pencil-square me-2"></i> Salvar Alterações
                </button>
            </div>
        </form>
    </div>
</div>
@endsection