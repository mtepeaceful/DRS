import { fichaDaEquipeSchema, resumoDaEquipeSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';

const UMA_HORA = 60 * 60_000;

export const equipesDaHistoria = queryOptions({
  queryKey: ['dicionario', 'equipes'],
  queryFn: ({ signal }) => buscar('/historia/equipes', z.array(resumoDaEquipeSchema), { signal }),
  staleTime: UMA_HORA,
});

export function fichaDaEquipe(id: string) {
  return queryOptions({
    queryKey: ['dicionario', 'equipes', id],
    queryFn: ({ signal }) =>
      buscar(`/historia/equipes/${encodeURIComponent(id)}`, fichaDaEquipeSchema, { signal }),
    staleTime: UMA_HORA,
  });
}
