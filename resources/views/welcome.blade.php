@extends('layouts.app')

@section('title', 'Dashboard F1 - Projetin v1')

@push('styles')
<style>
    /* Hero Section */
    .hero-section {
        padding: 80px 0;
        text-align: center;
    }

    .hero-title {
        font-size: 5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #fff 0%, var(--primary-racing) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 24px;
        text-transform: uppercase;
        letter-spacing: -2px;
        text-shadow: 0 0 30px rgba(255, 24, 1, 0.2);
    }

    .hero-subtitle {
        font-size: 1.1rem;
        color: #aaa;
        max-width: 700px;
        margin: 0 auto 40px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 500;
    }

    .btn-premium {
        background: var(--primary-racing);
        color: white;
        padding: 20px 50px;
        font-size: 1rem;
        font-weight: 800;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: var(--transition);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 15px;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 0 15px rgba(157, 80, 187, 0.3); /* Subtle Purple Glow */
    }

    .btn-premium:hover {
        background: var(--primary-hover);
        transform: scale(1.05);
        box-shadow: 0 0 30px rgba(157, 80, 187, 0.6);
        color: white;
    }

    .stats-card {
        border-radius: 4px;
        padding: 40px;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 20px rgba(255, 24, 1, 0.1), 0 0 30px rgba(157, 80, 187, 0.1); /* Dual Tone Glow */
    }

    .stats-card i {
        font-size: 2.5rem;
        color: white;
        margin-bottom: 20px;
        display: block;
        opacity: 0.9;
    }

    .stats-card:hover {
        border-color: rgba(255, 24, 1, 0.4);
        box-shadow: 0 0 25px rgba(255, 24, 1, 0.3), 0 0 35px rgba(157, 80, 187, 0.3);
        transform: translateY(-5px);
    }

    .stats-card h3 {
        color: white;
        font-weight: 900;
        letter-spacing: -1px;
    }

    .uppercase-text {
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.75rem;
    }
</style>
@endpush

@section('content')
<div class="hero-section">
    <h1 class="hero-title">Gerenciador do Grid F1</h1>
    <p class="hero-subtitle">Controle total sobre o grid oficial da Fórmula 1. Gerencie pilotos, equipes e títulos mundiais em uma interface de alta performance.</p>
    
    <div class="mb-5">
        <a href="{{ route('pilotos.index') }}" class="btn-premium">
            Entrar no Sistema <i class="bi bi-chevron-right"></i>
        </a>
    </div>


    <div class="row g-4 mt-5">
        <div class="col-md-4">
            <div class="stats-card carbon-inner">
                <i class="bi bi-people"></i>
                <h3 class="h1 mb-0">20</h3>
                <p class="text-secondary mb-0 uppercase-text">Pilotos Ativos</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stats-card carbon-inner">
                <i class="bi bi-shield-check"></i>
                <h3 class="h1 mb-0">10</h3>
                <p class="text-secondary mb-0 uppercase-text">Equipes</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stats-card carbon-inner">
                <i class="bi bi-trophy"></i>
                <h3 class="h1 mb-0">PRO</h3>
                <p class="text-secondary mb-0 uppercase-text">Hall da Fama</p>
            </div>
        </div>
    </div>
</div>
@endsection