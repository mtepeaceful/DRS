import { fichaDoCircuitoSchema, resumoDoCircuitoSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';

const UMA_HORA = 60 * 60_000;

export const listaDeCircuitos = queryOptions({
  queryKey: ['circuitos'],
  queryFn: ({ signal }) => buscar('/circuitos', z.array(resumoDoCircuitoSchema), { signal }),
  staleTime: UMA_HORA,
});

export function fichaDoCircuito(id: string) {
  return queryOptions({
    queryKey: ['circuitos', id],
    queryFn: ({ signal }) =>
      buscar(`/circuitos/${encodeURIComponent(id)}`, fichaDoCircuitoSchema, { signal }),
    staleTime: UMA_HORA,
  });
}
