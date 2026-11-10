import { z } from 'zod';

export const equipeSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
});

export const dadosEquipeSchema = z.object({
  nome: z.string().trim().min(1).max(100),
});

export type EquipeDTO = z.infer<typeof equipeSchema>;
export type DadosEquipeDTO = z.infer<typeof dadosEquipeSchema>;
