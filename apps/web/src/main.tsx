import { usarMensagensEmPortugues } from '@drs/contracts';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { rotas } from './app/rotas';
import { queryClient } from './shared/api/query-client';
import './styles/global.css';

usarMensagensEmPortugues();

const router = createBrowserRouter(rotas);
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
