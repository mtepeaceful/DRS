import { usarMensagensEmPortugues } from '@drs/contracts';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { EquipesPage } from './features/equipes/EquipesPage';
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
      { index: true, element: <PilotosPage /> },
      { path: 'pilotos/novo', element: <PilotoFormPage /> },
      { path: 'pilotos/:id', element: <PilotoDetalhesPage /> },
      { path: 'pilotos/:id/editar', element: <PilotoFormPage /> },
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
