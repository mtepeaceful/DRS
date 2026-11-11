import { z } from 'zod';

export const resultadoDaImportacaoSchema = z.object({
  ano: z.number().int(),
  equipes: z.object({ criadas: z.number().int(), atualizadas: z.number().int() }),
  pilotos: z.object({
    criados: z.number().int(),
    atualizados: z.number().int(),
    ignorados: z.array(z.object({ nome: z.string(), motivo: z.string() })),
  }),
});

export type ResultadoDaImportacaoDTO = z.infer<typeof resultadoDaImportacaoSchema>;
