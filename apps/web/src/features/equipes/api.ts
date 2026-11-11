import { type DadosEquipeDTO, equipeSchema } from '@drs/contracts';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { buscar } from '../../shared/api/http';

const chave = ['equipes'] as const;

export const listaDeEquipes = queryOptions({
  queryKey: chave,
  queryFn: ({ signal }) => buscar('/equipes', z.array(equipeSchema), { signal }),
});

export function useCadastrarEquipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosEquipeDTO) =>
      buscar('/equipes', equipeSchema, { method: 'POST', body: dados }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  });
}
