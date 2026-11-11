import { erroSchema, etapaSchema, resultadoDaEtapaSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { ConsultarCalendario } from '../../application/calendario/consultar-calendario.js';
import type { Corrida } from '../../application/ports/fonte-do-campeonato.js';

const CACHE_NO_NAVEGADOR = 'public, max-age=300';

function apresentarCorrida(corrida: Corrida) {
  return {
    ...corrida,
    inicio: corrida.inicio.toISOString(),
    sessoes: corrida.sessoes.map((sessao) => ({
      nome: sessao.nome,
      inicio: sessao.inicio.toISOString(),
    })),
  };
}

export const rotasCalendario: FastifyPluginAsyncZod<{ calendario: ConsultarCalendario }> = async (
  app,
  { calendario },
) => {
  app.get('/', { schema: { response: { 200: z.array(etapaSchema) } } }, async (_request, reply) => {
    reply.header('cache-control', CACHE_NO_NAVEGADOR);
    const etapas = await calendario.listar();

    return etapas.map((etapa) => ({ ...apresentarCorrida(etapa), vencedor: etapa.vencedor }));
  });

  app.get(
    '/:rodada',
    {
      schema: {
        params: z.object({ rodada: z.coerce.number().int().min(1).max(40) }),
        response: { 200: resultadoDaEtapaSchema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      const { etapa, classificacao } = await calendario.resultado(request.params.rodada);
      reply.header('cache-control', CACHE_NO_NAVEGADOR);

      return { etapa: apresentarCorrida(etapa), classificacao };
    },
  );
};
