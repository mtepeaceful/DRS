import { QueryClient } from '@tanstack/react-query';
import { ErroDaApi } from './http';

function erroDoCliente(erro: unknown) {
  return erro instanceof ErroDaApi && erro.status >= 400 && erro.status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (tentativas, erro) => !erroDoCliente(erro) && tentativas < 2,
    },
  },
});
