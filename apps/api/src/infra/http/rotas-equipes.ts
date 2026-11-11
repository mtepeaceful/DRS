import { dadosEquipeSchema, equipeSchema, erroSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { AtualizarEquipe } from '../../application/equipes/atualizar-equipe.js';
import type { CadastrarEquipe } from '../../application/equipes/cadastrar-equipe.js';
import type { ListarEquipes } from '../../application/equipes/listar-equipes.js';

export interface CasosDeUsoDeEquipes {
  listar: ListarEquipes;
  cadastrar: CadastrarEquipe;
  atualizar: AtualizarEquipe;
}

export const rotasEquipes: FastifyPluginAsyncZod<CasosDeUsoDeEquipes> = async (app, casos) => {
  app.get('/', { schema: { response: { 200: z.array(equipeSchema) } } }, () =>
    casos.listar.executar(),
  );

  app.post(
    '/',
    {
      schema: {
        body: dadosEquipeSchema,
        response: { 201: equipeSchema, 409: erroSchema },
      },
    },
    async (request, reply) => reply.status(201).send(await casos.cadastrar.executar(request.body)),
  );

  app.put(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: dadosEquipeSchema,
        response: { 200: equipeSchema, 404: erroSchema, 409: erroSchema },
      },
    },
    (request) => casos.atualizar.executar(request.params.id, request.body),
  );
};
