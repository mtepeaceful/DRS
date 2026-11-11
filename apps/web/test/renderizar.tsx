import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { rotas } from '../src/app/rotas';
import { iniciarSessao } from '../src/shared/api/sessao';
import { banco } from './servidor';

interface Opcoes {
  logado?: boolean;
}

export function renderizar(endereco: string, { logado = false }: Opcoes = {}) {
  banco.reiniciar();

  if (logado) {
    iniciarSessao('token-de-teste', new Date(Date.now() + 60 * 60_000).toISOString());
  }

  const router = createMemoryRouter(rotas, { initialEntries: [endereco] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router, usuario: userEvent.setup() };
}
