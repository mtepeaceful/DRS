import { usarMensagensEmPortugues } from '@drs/contracts';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { CalendarioPage } from './features/calendario/CalendarioPage';
import { ResultadoPage } from './features/calendario/ResultadoPage';
import { EquipesPage } from './features/equipes/EquipesPage';
import { HomePage } from './features/home/HomePage';
import { ApenasAdministrador } from './features/sessao/ApenasAdministrador';
import { EntrarPage } from './features/sessao/EntrarPage';
import { PilotoDetalhesPage } from './features/pilotos/PilotoDetalhesPage';
import { PilotoFormPage } from './features/pilotos/PilotoFormPage';
import { PilotosPage } from './features/pilotos/PilotosPage';
import { queryClient } from './shared/api/query-client';
import { Layout } from './shared/ui/Layout';
import { NaoEncontrada } from './shared/ui/NaoEncontrada';
import './styles/global.css';

usarMensagensEmPortugues();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'calendario', element: <CalendarioPage /> },
      { path: 'calendario/:rodada', element: <ResultadoPage /> },
      { path: 'pilotos', element: <PilotosPage /> },
      { path: 'pilotos/:id', element: <PilotoDetalhesPage /> },
      { path: 'entrar', element: <EntrarPage /> },
      {
        element: <ApenasAdministrador />,
        children: [
          { path: 'pilotos/novo', element: <PilotoFormPage /> },
          { path: 'pilotos/:id/editar', element: <PilotoFormPage /> },
        ],
      },
      { path: 'equipes', element: <EquipesPage /> },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
]);

const raiz = document.getElementById('root');

if (!raiz) {
  throw new Error('Elemento #root não encontrado');
}

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
