import { desempenhoDaTemporadaSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { buscar } from '../../shared/api/http';

export const desempenhoDaTemporada = queryOptions({
  queryKey: ['temporada', 'pilotos'],
  queryFn: ({ signal }) => buscar('/temporada/pilotos', desempenhoDaTemporadaSchema, { signal }),
  staleTime: 5 * 60_000,
});
