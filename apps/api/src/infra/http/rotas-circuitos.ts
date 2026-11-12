import { erroSchema, fichaDoCircuitoSchema, resumoDoCircuitoSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { ConsultarCircuitos } from '../../application/circuitos/consultar-circuitos.js';

const UMA_HORA = 'public, max-age=3600';

export const rotasCircuitos: FastifyPluginAsyncZod<{ circuitos: ConsultarCircuitos }> = async (
  app,
  { circuitos },
) => {
  app.get(
    '/',
    { schema: { response: { 200: z.array(resumoDoCircuitoSchema) } } },
    async (_request, reply) => {
      reply.header('cache-control', UMA_HORA);

      return circuitos.listar();
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,60}$/) }),
        response: { 200: fichaDoCircuitoSchema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      const ficha = await circuitos.detalhar(request.params.id, new Date());
      reply.header('cache-control', UMA_HORA);

      return {
        ...ficha,
        proximaCorrida: ficha.proximaCorrida && {
          ...ficha.proximaCorrida,
          inicio: ficha.proximaCorrida.inicio.toISOString(),
        },
      };
    },
  );
};
