import { z } from 'zod';

export const erroSchema = z.object({
  codigo: z.string(),
  mensagem: z.string(),
  campos: z.record(z.string(), z.array(z.string())).optional(),
});

export type ErroDTO = z.infer<typeof erroSchema>;
