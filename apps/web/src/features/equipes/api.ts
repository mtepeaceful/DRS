import { type DadosEquipeDTO, equipeSchema } from '@drs/contracts';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';

const chave = ['equipes'] as const;

export const listaDeEquipes = queryOptions({
  queryKey: chave,
  queryFn: ({ signal }) => buscar('/equipes', z.array(equipeSchema), { signal }),
});

export function useSalvarEquipe(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosEquipeDTO) =>
      buscar(id ? `/equipes/${id}` : '/equipes', equipeSchema, {
        method: id ? 'PUT' : 'POST',
        body: dados,
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: chave }),
        queryClient.invalidateQueries({ queryKey: ['pilotos'] }),
      ]),
  });
}
