import { etapaSchema, resultadoDaEtapaSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';

const CINCO_MINUTOS = 5 * 60_000;

export const calendario = queryOptions({
  queryKey: ['calendario'],
  queryFn: ({ signal }) => buscar('/calendario', z.array(etapaSchema), { signal }),
  staleTime: CINCO_MINUTOS,
});

export function resultadoDaEtapa(rodada: string) {
  return queryOptions({
    queryKey: ['calendario', rodada],
    queryFn: ({ signal }) =>
      buscar(`/calendario/${encodeURIComponent(rodada)}`, resultadoDaEtapaSchema, { signal }),
    staleTime: CINCO_MINUTOS,
  });
}
