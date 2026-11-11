@extends('layouts.app')

@section('title', $piloto->nome . ' - Grid F1')

@push('styles')
<style>
    .piloto-card {
        background: rgba(10, 10, 10, 0.9);
        padding: 40px;
        border-radius: 4px;
        border: 1px solid var(--primary-racing);
        box-shadow: 0 0 30px rgba(255, 24, 1, 0.3);
        color: white;
    }

    .piloto-numero {
        font-size: 4rem;
        font-weight: 800;
        line-height: 1;
        color: var(--primary-racing);
        text-shadow: 0 0 15px rgba(255, 24, 1, 0.4);
    }

    .piloto-dados dt {
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.8rem;
        color: var(--primary-racing);
    }

    .piloto-dados dd {
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 20px;
    }

    .btn-voltar {
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 1px;
    }

    .btn-voltar:hover {
        border-color: var(--primary-racing);
        color: white;
    }
</style>
@endpush

@section('content')
<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
    <h1 class="h2">
        {{ $piloto->nome }}
        @if ($piloto->titulos > 0)
            <span title="Campeão de F1">🏆</span>
        @endif
    </h1>
</div>

<div class="col-md-8 mx-auto">
    <div class="piloto-card">
        <div class="piloto-numero mb-4">#{{ $piloto->numero }}</div>

        <dl class="piloto-dados row">
            <div class="col-sm-6">
                <dt>Equipe</dt>
                <dd>{{ $piloto->equipe }}</dd>
            </div>
            <div class="col-sm-6">
                <dt>Nacionalidade</dt>
                <dd>{{ $piloto->nacionalidade }}</dd>
            </div>
            <div class="col-sm-6">
                <dt>Títulos Mundiais</dt>
                <dd>{{ $piloto->titulos }}</dd>
            </div>
        </dl>

        <div class="d-flex flex-wrap gap-2">
            <a href="{{ route('pilotos.edit', $piloto->id) }}" class="btn btn-racing">
                <i class="bi bi-pencil-square me-2"></i>Editar
            </a>
            <a href="{{ route('pilotos.index') }}" class="btn btn-voltar">
                <i class="bi bi-arrow-left me-2"></i>Voltar
            </a>
        </div>
    </div>
</div>
@endsection
