import { z } from 'zod';

export const resumoDaEquipeSchema = z.object({
  id: z.string(),
  nome: z.string(),
  pais: z.string().nullable(),
  wikipedia: z.string().nullable(),
  titulosDeConstrutores: z.number().int(),
  titulosDePilotos: z.number().int(),
  noGridAtual: z.boolean(),
});

export const fichaDaEquipeSchema = resumoDaEquipeSchema.extend({
  temporadas: z.array(z.number().int()),
  corridas: z.number().int(),
  vitorias: z.number().int(),
  podios: z.number().int(),
  poles: z.number().int(),
  anosDeTitulo: z.array(z.number().int()),
  campeoesDePilotos: z.array(z.object({ ano: z.number().int(), piloto: z.string() })),
  verbete: z
    .object({
      resumo: z.string(),
      fonte: z.url({ protocol: /^https$/ }),
      fundacao: z.number().int().nullable(),
      fundadores: z.array(z.string()),
      sede: z.string().nullable(),
    })
    .nullable(),
  temporadaAtual: z
    .object({
      posicao: z.number().int(),
      pontos: z.number(),
      pilotos: z.array(z.object({ nome: z.string(), pontos: z.number() })),
    })
    .nullable(),
});

export type ResumoDaEquipeDTO = z.infer<typeof resumoDaEquipeSchema>;
export type FichaDaEquipeDTO = z.infer<typeof fichaDaEquipeSchema>;
