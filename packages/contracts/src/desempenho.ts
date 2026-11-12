import { z } from 'zod';

export const desempenhoDaTemporadaSchema = z.object({
  ano: z.number().int(),
  rodadasDisputadas: z.number().int(),
  pilotos: z.array(
    z.object({
      nome: z.string(),
      equipe: z.string(),
      posicao: z.number().int(),
      pontos: z.number(),
      vitorias: z.number().int(),
      podios: z.number().int(),
      poles: z.number().int(),
      corridas: z.number().int(),
      abandonos: z.number().int(),
      melhorResultado: z.number().int().nullable(),
      mediaDeChegada: z.number().nullable(),
      etapas: z.array(
        z.object({
          rodada: z.number().int(),
          posicao: z.number().int().nullable(),
          largada: z.number().int(),
          pontos: z.number(),
        }),
      ),
    }),
  ),
});

export type DesempenhoDaTemporadaDTO = z.infer<typeof desempenhoDaTemporadaSchema>;
export type DesempenhoDoPilotoDTO = DesempenhoDaTemporadaDTO['pilotos'][number];
