import { z } from 'zod';

const corSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: 'Informe uma cor no formato #rrggbb.' })
  .transform((cor) => cor.toLowerCase());

export const equipeSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  cor: z.string(),
  corSecundaria: z.string(),
});

export const dadosEquipeSchema = z.object({
  nome: z.string().trim().min(1, { error: 'Informe o nome da equipe.' }).max(100),
  cor: corSchema,
  corSecundaria: corSchema,
});

export type EquipeDTO = z.infer<typeof equipeSchema>;
export type DadosEquipeDTO = z.infer<typeof dadosEquipeSchema>;
