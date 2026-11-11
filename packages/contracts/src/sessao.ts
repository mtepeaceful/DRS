import { z } from 'zod';

export const entrarSchema = z.object({
  senha: z.string().min(1, { error: 'Informe a senha.' }).max(200),
});

export const sessaoSchema = z.object({
  token: z.string(),
  expiraEm: z.iso.datetime(),
});

export type EntrarDTO = z.infer<typeof entrarSchema>;
export type SessaoDTO = z.infer<typeof sessaoSchema>;
