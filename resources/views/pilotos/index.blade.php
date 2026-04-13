@extends('layouts.app')

@section('title', 'Grid F1 - Pilotos')

@push('styles')
    <style>
        /* Content Padding */
        main {
            padding: 40px !important;
            color: #ffffff;
        }

        h1, h2, h3, .h2 {
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--primary-racing);
            text-shadow: 0 0 10px rgba(255, 24, 1, 0.3);
        }

        /* Search Bar */
        .search-container {
            margin-bottom: 32px;
        }

        .search-input {
            padding: 12px 20px !important;
            border-radius: 4px 0 0 4px !important;
            border: 1px solid rgba(255, 24, 1, 0.3) !important;
            background: rgba(18, 18, 18, 0.9) !important;
            color: white !important;
            font-weight: 500;
        }

        .search-btn {
            background-color: var(--primary-racing) !important;
            border: 1px solid var(--primary-racing) !important;
            padding: 12px 24px !important;
            border-radius: 0 4px 4px 0 !important;
            font-weight: 700 !important;
            color: white !important;
            text-transform: uppercase;
        }

        /* Table Style */
        .table-container {
            background: rgba(10, 10, 10, 0.9);
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid rgba(255, 24, 1, 0.4);
            box-shadow: 0 0 20px rgba(255, 24, 1, 0.15);
        }

        .table {
            margin-bottom: 0 !important;
            color: #e2e8f0 !important;
            font-weight: 500;
        }

        .table th {
            font-weight: 700 !important;
            color: var(--primary-racing) !important;
            text-transform: uppercase !important;
            letter-spacing: 1px;
            border-bottom: 2px solid rgba(255, 24, 1, 0.3) !important;
        }

        .table td {
            padding: 16px !important;
            vertical-align: middle !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            transition: all 0.2s ease;
        }

        .table tbody tr {
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
        }

        .table tbody tr:hover {
            background-color: rgba(255, 24, 1, 0.05) !important;
            border-left: 3px solid var(--primary-racing);
            box-shadow: inset 5px 0 15px rgba(255, 24, 1, 0.1);
        }

        /* Numbers in table */
        .td-number {
            font-weight: 800;
            color: white;
            font-size: 1.1rem;
        }

        /* Action Buttons */
        .btn-action {
            padding: 8px 16px !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            border-radius: 2px !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: var(--transition) !important;
        }

        .btn-ver {
            background-color: transparent !important;
            border: 1px solid var(--primary-racing) !important;
            color: white !important;
        }

        .btn-ver:hover {
            background-color: var(--primary-racing) !important;
            box-shadow: 0 0 15px var(--primary-racing);
        }

        .btn-editar {
            background-color: var(--primary-racing) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .btn-excluir {
            background-color: #333 !important;
            color: #ff4444 !important;
            border: 1px solid #ff4444 !important;
        }

        .btn-excluir:hover {
            background-color: #ff4444 !important;
            color: white !important;
            box-shadow: 0 0 15px #ff4444;
        }
    </style>
@endpush

@section('content')
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Pilotos</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
                <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1">
                <i class="bi bi-calendar3"></i> Este mês
            </button>
        </div>
    </div>

    <div class="table-responsive small">
        @if (session('sucesso'))
            <div class="alert-custom-success">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{session('sucesso')}}
            </div>
        @endif

        <div class="search-container">
            <form method="GET" action="{{ route('pilotos.index') }}">
                @csrf
                <div class="input-group">
                    <input type="text" name="busca" class="form-control search-input"
                        placeholder="Buscar por nome ou equipe..." value="{{ request('busca')}}">
                    <button class="btn search-btn" type="submit">
                        <i class="bi bi-search"></i> Buscar
                    </button>
                </div>
            </form>
        </div>

        <div class="table-container shadow-sm">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Nº</th>
                        <th scope="col">Nacionalidade</th>
                        <th scope="col">Equipe</th>
                        <th scope="col">Títulos</th>
                        <th scope="col">Ver</th>
                        <th scope="col">Editar</th>
                        <th scope="col">Excluir</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($pilotos as $piloto)
                        <tr>
                            <td class="td-number">#{{ $piloto->id }}</td>
                            <td style="font-weight: 700;">
                                {{ $piloto->nome }}
                                @if($piloto->titulos > 0)
                                    <span title="Campeão de F1">🏆</span>
                                @endif
                            </td>
                            <td class="td-number">{{ $piloto->numero }}</td>
                            <td>{{ $piloto->nacionalidade }}</td>
                            <td style="font-weight: 600; color: #aaa;">{{ $piloto->equipe }}</td>
                            <td class="td-number">{{ $piloto->titulos }}</td>
                            <td>
                                <button type="button" class="btn btn-action btn-ver" data-bs-toggle="modal"
                                    data-bs-target="#verPiloto{{ $piloto->id }}">
                                    Ver+
                                </button>
                            </td>
                            <td>
                                <a href="{{ route('pilotos.edit', $piloto->id) }}" class="btn btn-action btn-editar">Editar</a>
                            </td>
                            <td>
                                <form action="{{ route('pilotos.destroy', $piloto->id) }}" method="post">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-action btn-excluir">Excluir</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{ $pilotos->appends(['busca' => request('busca')])->links() }}


    @foreach ($pilotos as $piloto)
        <div class="modal fade" id="verPiloto{{ $piloto->id }}" tabindex="-1" aria-labelledby="modalLabel{{ $piloto->id }}"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content" style="background: #0a0a0a; border: 1px solid var(--primary-racing); box-shadow: 0 0 30px rgba(255, 24, 1, 0.3); color: white;">
                    <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <h1 class="modal-title fs-5" id="modalLabel{{ $piloto->id }}" style="font-weight: 800; text-transform: uppercase; color: var(--primary-racing);">{{ $piloto->nome }}</h1>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong style="color: var(--primary-racing); text-transform: uppercase; font-size: 0.8rem;">Número:</strong> <span class="td-number">{{ $piloto->numero }}</span></p>
                        <p><strong style="color: var(--primary-racing); text-transform: uppercase; font-size: 0.8rem;">Equipe:</strong> {{ $piloto->equipe }}</p>
                        <p><strong style="color: var(--primary-racing); text-transform: uppercase; font-size: 0.8rem;">Nacionalidade:</strong> {{ $piloto->nacionalidade }}</p>
                        <p><strong style="color: var(--primary-racing); text-transform: uppercase; font-size: 0.8rem;">Títulos Mundiais:</strong> <span class="td-number">{{ $piloto->titulos }}</span></p>
                    </div>
                    <div class="modal-footer" style="border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <button type="button" class="btn btn-racing" data-bs-dismiss="modal" style="padding: 8px 24px;">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    @endforeach
@endsection

@push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.addEventListener('hidden.bs.modal', function () {
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(b => b.remove());
                    document.body.style.overflow = 'auto';
                    document.body.style.paddingRight = '0';
                });
            });
        });
    </script>
@endpush