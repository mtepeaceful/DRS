import { fichaDoPilotoDaF1Schema, resumoDoPilotoDaF1Schema } from '@drs/contracts';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';
import type { Idioma } from '../../shared/i18n/idioma';
import { semAcento } from '../../shared/lib/texto';

const UMA_HORA = 60 * 60_000;

export const pilotosDaHistoria = queryOptions({
  queryKey: ['historia', 'pilotos'],
  queryFn: ({ signal }) =>
    buscar('/historia/pilotos', z.array(resumoDoPilotoDaF1Schema), { signal }),
  staleTime: UMA_HORA,
});

export function fichaDoPilotoDaF1(id: string, idioma: Idioma) {
  return queryOptions({
    queryKey: ['historia', 'pilotos', id, idioma],
    queryFn: ({ signal }) =>
      buscar(
        `/historia/pilotos/${encodeURIComponent(id)}?lang=${idioma}`,
        fichaDoPilotoDaF1Schema,
        { signal },
      ),
    staleTime: UMA_HORA,
  });
}

export function useLinkDoPiloto() {
  const { data } = useQuery({
    ...pilotosDaHistoria,
    select: (pilotos) => new Map(pilotos.map((piloto) => [semAcento(piloto.nome), piloto.id])),
  });

  return (nome: string) => {
    const id = data?.get(semAcento(nome));

    return id ? `/historia/pilotos/${id}` : null;
  };
}
