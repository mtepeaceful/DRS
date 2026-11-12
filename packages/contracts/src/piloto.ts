import { z } from 'zod';
import { equipeSchema } from './equipe.js';
import { paginaSchema } from './paginacao.js';

function aoFaltar(mensagem: string) {
  return (problema: { code?: string }) => (problema.code === 'invalid_type' ? mensagem : undefined);
}

export const NUMERO_MINIMO = 0;
export const NUMERO_MAXIMO = 99;

export const pilotoSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  numero: z.number().int(),
  pais: z.string(),
  titulos: z.number().int(),
  equipe: equipeSchema,
  criadoEm: z.iso.datetime(),
  atualizadoEm: z.iso.datetime(),
});

export const dadosPilotoSchema = z.object({
  nome: z.string().trim().min(1, { error: 'Informe o nome do piloto.' }).max(255),
  numero: z
    .number({ error: aoFaltar('Informe o número do piloto.') })
    .int()
    .min(NUMERO_MINIMO)
    .max(NUMERO_MAXIMO),
  pais: z.string().regex(/^[A-Z]{2}$/, { error: 'Selecione um país.' }),
  equipeId: z.uuid({ error: 'Selecione uma equipe.' }),
  titulos: z
    .number({ error: aoFaltar('Informe a quantidade de títulos.') })
    .int()
    .min(0)
    .default(0),
});

export const listarPilotosQuerySchema = z.object({
  busca: z.string().trim().max(100).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(50).default(10),
});

export const paginaDePilotosSchema = paginaSchema(pilotoSchema);

export const carreiraSchema = z
  .object({
    nascimento: z.iso.date().nullable(),
    estreia: z.number().int(),
    temporadas: z.number().int(),
    corridas: z.number().int(),
    vitorias: z.number().int(),
    podios: z.number().int(),
    poles: z.number().int(),
    titulos: z.array(z.number().int()),
  })
  .nullable();

export type PilotoDTO = z.infer<typeof pilotoSchema>;
export type DadosPilotoDTO = z.infer<typeof dadosPilotoSchema>;
export type ListarPilotosQuery = z.infer<typeof listarPilotosQuerySchema>;
export type PaginaDePilotosDTO = z.infer<typeof paginaDePilotosSchema>;
export type CarreiraDTO = z.infer<typeof carreiraSchema>;
