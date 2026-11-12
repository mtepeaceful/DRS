import { z } from 'zod';
import { verbeteSchema } from './verbete.js';

const pilotoDaF1Schema = z.object({
  id: z.string(),
  nome: z.string(),
  pais: z.string().nullable(),
  nascimento: z.iso.date().nullable(),
  wikipedia: z.string().nullable(),
});

export const resumoDoPilotoDaF1Schema = pilotoDaF1Schema.extend({ titulos: z.number().int() });

export const fichaDoPilotoDaF1Schema = pilotoDaF1Schema.extend({
  temporadas: z.array(z.number().int()),
  corridas: z.number().int(),
  vitorias: z.number().int(),
  podios: z.number().int(),
  poles: z.number().int(),
  equipes: z.array(z.object({ id: z.string(), nome: z.string() })),
  anosDeTitulo: z.array(z.number().int()),
  verbete: verbeteSchema.nullable(),
});

export type ResumoDoPilotoDaF1DTO = z.infer<typeof resumoDoPilotoDaF1Schema>;
export type FichaDoPilotoDaF1DTO = z.infer<typeof fichaDoPilotoDaF1Schema>;
