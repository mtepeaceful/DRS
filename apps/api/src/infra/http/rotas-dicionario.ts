import { erroSchema, fichaDaEquipeSchema, resumoDaEquipeSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { ConsultarDicionario } from '../../application/equipes/consultar-dicionario.js';

const UMA_HORA = 'public, max-age=3600';

export const rotasDicionario: FastifyPluginAsyncZod<{ dicionario: ConsultarDicionario }> = async (
  app,
  { dicionario },
) => {
  app.get(
    '/',
    { schema: { response: { 200: z.array(resumoDaEquipeSchema) } } },
    async (_request, reply) => {
      reply.header('cache-control', UMA_HORA);

      return dicionario.listar(new Date());
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,60}$/) }),
        response: { 200: fichaDaEquipeSchema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      const ficha = await dicionario.detalhar(request.params.id, new Date());
      reply.header('cache-control', UMA_HORA);

      return ficha;
    },
  );
};
