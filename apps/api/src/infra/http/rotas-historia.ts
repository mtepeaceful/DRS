import { erroSchema, historiaDosCampeoesSchema, temporadaHistoricaSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { ConsultarHistoria } from '../../application/historia/consultar-historia.js';

const UMA_HORA = 'public, max-age=3600';
const UM_MINUTO = 'public, max-age=60';

export const rotasHistoria: FastifyPluginAsyncZod<{ historia: ConsultarHistoria }> = async (
  app,
  { historia },
) => {
  app.get(
    '/campeoes',
    { schema: { response: { 200: historiaDosCampeoesSchema } } },
    async (_request, reply) => {
      const resultado = await historia.listarCampeoes(new Date());
      reply.header('cache-control', resultado.faltando > 0 ? UM_MINUTO : UMA_HORA);

      return resultado;
    },
  );

  app.get(
    '/:ano',
    {
      schema: {
        params: z.object({ ano: z.coerce.number().int().min(1950).max(2100) }),
        response: { 200: temporadaHistoricaSchema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      const temporada = await historia.temporada(request.params.ano, new Date());
      reply.header('cache-control', UMA_HORA);

      return temporada;
    },
  );
};
