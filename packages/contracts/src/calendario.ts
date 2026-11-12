import { z } from 'zod';

const sessaoSchema = z.object({ nome: z.string(), inicio: z.iso.datetime() });

export const corridaSchema = z.object({
  rodada: z.number().int(),
  nome: z.string(),
  circuito: z.string(),
  cidade: z.string(),
  pais: z.string(),
  inicio: z.iso.datetime(),
  sessoes: z.array(sessaoSchema),
});

export const etapaSchema = corridaSchema.extend({
  vencedor: z.object({ nome: z.string(), equipe: z.string() }).nullable(),
});

const linhaDoResultadoSchema = z.object({
  posicao: z.number().int(),
  classificado: z.boolean(),
  nome: z.string(),
  numero: z.number().int(),
  equipe: z.string(),
  largada: z.number().int(),
  voltas: z.number().int(),
  tempo: z.string().nullable(),
  situacao: z.string(),
  pontos: z.number(),
  voltaMaisRapida: z.boolean(),
});

export const resultadoDaEtapaSchema = z.object({
  etapa: corridaSchema,
  classificacao: z.array(linhaDoResultadoSchema),
  sprint: z.array(linhaDoResultadoSchema),
  qualificacao: z.array(
    z.object({
      posicao: z.number().int(),
      nome: z.string(),
      numero: z.number().int(),
      equipe: z.string(),
      q1: z.string().nullable(),
      q2: z.string().nullable(),
      q3: z.string().nullable(),
    }),
  ),
});

export type EtapaDTO = z.infer<typeof etapaSchema>;
export type ResultadoDaEtapaDTO = z.infer<typeof resultadoDaEtapaSchema>;
