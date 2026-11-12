import { z } from 'zod';

const recordistaSchema = z.object({
  nome: z.string(),
  pais: z.string().nullable(),
  titulos: z.number().int(),
  anos: z.array(z.number().int()),
});

export const historiaDosCampeoesSchema = z.object({
  temporadas: z.array(
    z.object({
      ano: z.number().int(),
      piloto: z.string(),
      pais: z.string().nullable(),
      equipe: z.string(),
      pontos: z.number(),
      vitorias: z.number().int(),
      construtor: z
        .object({ nome: z.string(), pontos: z.number(), vitorias: z.number().int() })
        .nullable(),
    }),
  ),
  faltando: z.number().int(),
  maioresPilotos: z.array(recordistaSchema),
  maioresConstrutores: z.array(recordistaSchema),
});

export const temporadaHistoricaSchema = z.object({
  ano: z.number().int(),
  corridas: z.array(
    z.object({
      rodada: z.number().int(),
      nome: z.string(),
      circuito: z.string(),
      pais: z.string(),
      data: z.iso.date(),
      vencedor: z.object({ nome: z.string(), equipe: z.string() }).nullable(),
    }),
  ),
  pilotos: z.array(
    z.object({
      posicao: z.number().int(),
      nome: z.string(),
      pais: z.string().nullable(),
      equipes: z.array(z.string()),
      pontos: z.number(),
      vitorias: z.number().int(),
    }),
  ),
  construtores: z.array(
    z.object({
      posicao: z.number().int(),
      nome: z.string(),
      pontos: z.number(),
      vitorias: z.number().int(),
    }),
  ),
});

export type HistoriaDosCampeoesDTO = z.infer<typeof historiaDosCampeoesSchema>;
export type TemporadaHistoricaDTO = z.infer<typeof temporadaHistoricaSchema>;
