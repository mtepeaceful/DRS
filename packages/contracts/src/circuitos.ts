import { z } from 'zod';
import { verbeteSchema } from './verbete.js';

export const resumoDoCircuitoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  cidade: z.string(),
  pais: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  wikipedia: z.string().nullable(),
  noCalendarioAtual: z.boolean(),
});

const maiorSchema = z.object({ nome: z.string(), vitorias: z.number().int() });

export const fichaDoCircuitoSchema = resumoDoCircuitoSchema.extend({
  vitorias: z.array(
    z.object({
      ano: z.number().int(),
      rodada: z.number().int(),
      gp: z.string(),
      piloto: z.string(),
      equipe: z.string(),
    }),
  ),
  maioresPilotos: z.array(maiorSchema),
  maioresEquipes: z.array(maiorSchema),
  verbete: verbeteSchema.nullable(),
  proximaCorrida: z
    .object({ rodada: z.number().int(), nome: z.string(), inicio: z.iso.datetime() })
    .nullable(),
});

export type ResumoDoCircuitoDTO = z.infer<typeof resumoDoCircuitoSchema>;
export type FichaDoCircuitoDTO = z.infer<typeof fichaDoCircuitoSchema>;
