import { desempenhoDaTemporadaSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { ConsultarDesempenho } from '../../application/desempenho/consultar-desempenho.js';

export const rotasDesempenho: FastifyPluginAsyncZod<{ desempenho: ConsultarDesempenho }> = async (
  app,
  { desempenho },
) => {
  app.get(
    '/pilotos',
    { schema: { response: { 200: desempenhoDaTemporadaSchema } } },
    async (_request, reply) => {
      reply.header('cache-control', 'public, max-age=300');

      return desempenho.executar(new Date());
    },
  );
};
