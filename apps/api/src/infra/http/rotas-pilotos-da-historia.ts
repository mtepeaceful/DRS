import { erroSchema, fichaDoPilotoDaF1Schema, resumoDoPilotoDaF1Schema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { ConsultarPilotosDaHistoria } from '../../application/historia/consultar-pilotos-da-historia.js';

const UMA_HORA = 'public, max-age=3600';

export const rotasPilotosDaHistoria: FastifyPluginAsyncZod<{
  pilotos: ConsultarPilotosDaHistoria;
}> = async (app, { pilotos }) => {
  app.get(
    '/',
    { schema: { response: { 200: z.array(resumoDoPilotoDaF1Schema) } } },
    async (_request, reply) => {
      reply.header('cache-control', UMA_HORA);

      return pilotos.listar();
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,60}$/) }),
        response: { 200: fichaDoPilotoDaF1Schema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      const ficha = await pilotos.detalhar(request.params.id);
      reply.header('cache-control', UMA_HORA);

      return ficha;
    },
  );
};
