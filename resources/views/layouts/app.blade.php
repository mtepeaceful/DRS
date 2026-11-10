<!DOCTYPE html>
<html lang="en" data-bs-theme="auto">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'F1 Dashboard - Projetin v1')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/5.3/examples/dashboard/dashboard.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-racing: #FF1801;
            --primary-hover: #D11400;
            --neon-purple: #9d50bb;
            --bg-deep: #08090A;
            --sidebar-bg: #050505;
            --border-radius: 4px;
            --sidebar-width: 250px;
            --transition: all 0.2s ease-in-out;
        }

        body {
            background-color: var(--bg-deep);
            background-image: 
                linear-gradient(45deg, #0d0e0f 25%, transparent 25%), 
                linear-gradient(-45deg, #0d0e0f 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #0d0e0f 75%),
                linear-gradient(-45deg, transparent 75%, #0d0e0f 75%);
            background-size: 12px 12px;
            background-position: 0 0, 0 6px, 6px 6px, 6px 0;
            font-family: 'Orbitron', sans-serif;
            color: #ffffff;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container-fluid-wrapper {
            background: rgba(8, 9, 10, 0.85);
            min-height: 100vh;
            backdrop-filter: blur(4px);
        }

        /* Sidebar Style */
        .sidebar {
            background: var(--sidebar-bg) !important;
            border-right: 1px solid rgba(255, 24, 1, 0.3) !important;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
            min-height: 100vh;
            position: fixed;
            z-index: 1000;
        }

        .sidebar .nav-link {
            padding: 16px 24px !important;
            color: #888 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.85rem;
            font-weight: 500;
            transition: var(--transition);
            border-left: 3px solid transparent;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .sidebar .nav-link i {
            font-size: 1.1rem;
            opacity: 0.7;
        }

        .sidebar .nav-link:hover {
            color: var(--primary-racing) !important;
            background: rgba(255, 24, 1, 0.05);
            border-left: 3px solid var(--primary-racing);
        }

        .sidebar .nav-link:hover i {
            opacity: 1;
        }

        .sidebar .nav-link.active {
            background: linear-gradient(90deg, rgba(255, 24, 1, 0.15) 0%, transparent 100%) !important;
            color: var(--primary-racing) !important;
            border-left: 3px solid var(--primary-racing);
            text-shadow: 0 0 10px rgba(255, 24, 1, 0.5);
        }

        .sidebar .nav-link.active i {
            opacity: 1;
            color: var(--primary-racing);
            filter: drop-shadow(0 0 5px rgba(255, 24, 1, 0.5));
        }

        main {
            padding-top: 20px;
        }

        /* Neon Components */
        .neon-card {
            background: rgba(18, 18, 18, 0.8);
            border: 1px solid rgba(157, 80, 187, 0.4);
            box-shadow: 0 0 15px rgba(157, 80, 187, 0.1);
            position: relative;
            transition: var(--transition);
        }

        .neon-card:hover {
            border-color: var(--primary-racing) !important;
            box-shadow: 0 0 20px rgba(255, 24, 1, 0.3);
            transform: translateY(-2px);
        }

        /* Carbon Texture Utility */
        .carbon-inner {
            background-image: 
                linear-gradient(45deg, #111 25%, transparent 25%), 
                linear-gradient(-45deg, #111 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #111 75%),
                linear-gradient(-45deg, transparent 75%, #111 75%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px 5px, 5px 0;
            background-color: #0c0d0e;
        }

        /* Racing Button */
        .btn-racing {
            background: var(--primary-racing);
            color: white;
            border: 1px solid var(--neon-purple);
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
            transition: var(--transition);
            box-shadow: 0 0 10px rgba(157, 80, 187, 0.2);
        }

        .btn-racing:hover {
            background: var(--primary-hover);
            box-shadow: 0 0 20px rgba(157, 80, 187, 0.5);
            color: white;
        }

        /* Global Focus Shadow */
        .form-control {
            background: #111 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }

        .form-control:focus {
            border-color: var(--primary-racing) !important;
            box-shadow: 0 0 0 4px rgba(255, 24, 1, 0.25), 0 0 10px rgba(255, 24, 1, 0.3) !important;
        }

        /* Custom Pagination Theme */
        .pagination {
            display: flex;
            gap: 5px;
            margin-top: 20px;
        }

        .pagination .page-link {
            background-color: rgba(18, 18, 18, 0.9) !important;
            border: 1px solid rgba(255, 24, 1, 0.3) !important;
            color: white !important;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            border-radius: 2px !important;
            padding: 8px 16px;
        }

        .pagination .page-item.active .page-link {
            background-color: var(--primary-racing) !important;
            border-color: var(--primary-racing) !important;
            box-shadow: 0 0 10px rgba(255, 24, 1, 0.5);
        }

        .pagination .page-link:hover {
            background-color: rgba(255, 24, 1, 0.1) !important;
            border-color: var(--primary-racing) !important;
        }
    </style>
    @stack('styles')
</head>

<body>
    <div class="container-fluid-wrapper">
        <div class="container-fluid">
            <div class="row">

                <div class="sidebar carbon-inner col-md-3 col-lg-2 p-0">
                    <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-4 overflow-y-auto">
                        <ul class="nav flex-column">
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('home-site') ? 'active' : '' }}" href="{{ route('home-site') }}">
                                    <i class="bi bi-house"></i> Painel Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('pilotos.index') ? 'active' : '' }}" href="{{ route('pilotos.index') }}">
                                    <i class="bi bi-flag"></i> Grid F1
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('pilotos.create') ? 'active' : '' }}" href="{{ route('pilotos.create') }}">
                                    <i class="bi bi-plus-circle"></i> Novo Piloto
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('configuracoes') ? 'active' : '' }}" href="{{ route('configuracoes') }}">
                                    <i class="bi bi-gear"></i> Configurações
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('busca-factory') ? 'active' : '' }}" href="{{ route('busca-factory') }}">
                                    <i class="bi bi-search"></i> Busca Factory
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>


                <main class="main-content col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    @yield('content')
                </main>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>

</html>
