import { z } from 'zod';

export const equipeSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
});

export const dadosEquipeSchema = z.object({
  nome: z.string().trim().min(1, { error: 'Informe o nome da equipe.' }).max(100),
});

export type EquipeDTO = z.infer<typeof equipeSchema>;
export type DadosEquipeDTO = z.infer<typeof dadosEquipeSchema>;
