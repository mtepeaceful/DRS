import { z } from 'zod';
import { corridaSchema } from './calendario.js';

const posicaoSchema = z.object({
  posicao: z.number().int(),
  nome: z.string(),
  pontos: z.number(),
  vitorias: z.number().int(),
});

export const painelSchema = z.object({
  campeonato: z
    .object({
      ano: z.number().int(),
      totalDeRodadas: z.number().int(),
      rodadasDisputadas: z.number().int(),
      proximaCorrida: corridaSchema.nullable(),
      pilotos: z.array(posicaoSchema.extend({ equipe: z.string() })),
      construtores: z.array(posicaoSchema),
      ultimaCorrida: z
        .object({
          rodada: z.number().int(),
          nome: z.string(),
          data: z.iso.datetime(),
          podio: z.array(
            z.object({ posicao: z.number().int(), nome: z.string(), equipe: z.string() }),
          ),
        })
        .nullable(),
    })
    .nullable(),
  noticias: z.array(
    z.object({
      titulo: z.string(),
      link: z.url({ protocol: /^https$/ }),
      fonte: z.string(),
      publicadaEm: z.iso.datetime(),
    }),
  ),
});

export type PainelDTO = z.infer<typeof painelSchema>;
