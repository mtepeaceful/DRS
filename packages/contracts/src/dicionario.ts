import { z } from 'zod';
import { verbeteSchema } from './verbete.js';

export const resumoDaEquipeSchema = z.object({
  id: z.string(),
  nome: z.string(),
  pais: z.string().nullable(),
  wikipedia: z.string().nullable(),
  titulosDeConstrutores: z.number().int(),
  titulosDePilotos: z.number().int(),
  noGridAtual: z.boolean(),
});

export const perfilDaEquipeSchema = z.object({
  temporada: z.number().int(),
  nomeCompleto: z.string(),
  sede: z.object({ cidade: z.string(), pais: z.string() }),
  chefes: z.array(z.string()),
  chefesTecnicos: z.array(z.string()),
  chassi: z.string(),
  motor: z.string(),
  reservas: z.array(z.string()),
  primeiraInscricao: z.number().int(),
  fonte: z.string(),
});

export const fichaDaEquipeSchema = resumoDaEquipeSchema.extend({
  temporadas: z.array(z.number().int()),
  corridas: z.number().int(),
  vitorias: z.number().int(),
  podios: z.number().int(),
  poles: z.number().int(),
  anosDeTitulo: z.array(z.number().int()),
  campeoesDePilotos: z.array(z.object({ ano: z.number().int(), piloto: z.string() })),
  verbete: verbeteSchema.nullable(),
  perfil: perfilDaEquipeSchema.nullable(),
  temporadaAtual: z
    .object({
      posicao: z.number().int(),
      pontos: z.number(),
      pilotos: z.array(z.object({ nome: z.string(), pontos: z.number() })),
    })
    .nullable(),
});

export type ResumoDaEquipeDTO = z.infer<typeof resumoDaEquipeSchema>;
export type PerfilDaEquipeDTO = z.infer<typeof perfilDaEquipeSchema>;
export type FichaDaEquipeDTO = z.infer<typeof fichaDaEquipeSchema>;
