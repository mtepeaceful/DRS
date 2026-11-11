import { type DadosPilotoDTO, paginaDePilotosSchema, pilotoSchema } from '@drs/contracts';
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { buscar, enviar } from '../../shared/api/http';

export const PILOTOS_POR_PAGINA = 12;

const chaves = {
  listas: ['pilotos', 'lista'] as const,
  lista: (busca: string, pagina: number) => ['pilotos', 'lista', { busca, pagina }] as const,
  detalhe: (id: string) => ['pilotos', 'detalhe', id] as const,
};

export function listaDePilotos(busca: string, pagina: number) {
  return queryOptions({
    queryKey: chaves.lista(busca, pagina),
    queryFn: ({ signal }) => {
      const parametros = new URLSearchParams({
        pagina: String(pagina),
        porPagina: String(PILOTOS_POR_PAGINA),
      });

      if (busca) {
        parametros.set('busca', busca);
      }

      return buscar(`/pilotos?${parametros}`, paginaDePilotosSchema, { signal });
    },
    placeholderData: keepPreviousData,
  });
}

export function detalheDoPiloto(id: string) {
  return queryOptions({
    queryKey: chaves.detalhe(id),
    queryFn: ({ signal }) => buscar(`/pilotos/${encodeURIComponent(id)}`, pilotoSchema, { signal }),
  });
}

export function useSalvarPiloto(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosPilotoDTO) =>
      buscar(id ? `/pilotos/${id}` : '/pilotos', pilotoSchema, {
        method: id ? 'PUT' : 'POST',
        body: dados,
      }),
    onSuccess: (piloto) => {
      queryClient.setQueryData(chaves.detalhe(piloto.id), piloto);

      return queryClient.invalidateQueries({ queryKey: chaves.listas });
    },
  });
}

export function useExcluirPiloto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enviar(`/pilotos/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.listas }),
  });
}
