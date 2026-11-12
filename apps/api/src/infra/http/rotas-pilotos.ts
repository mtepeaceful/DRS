import {
  carreiraSchema,
  dadosPilotoSchema,
  erroSchema,
  fotosDosPilotosSchema,
  listarPilotosQuerySchema,
  paginaDePilotosSchema,
  pilotoSchema,
} from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { AtualizarPiloto } from '../../application/pilotos/atualizar-piloto.js';
import type { CadastrarPiloto } from '../../application/pilotos/cadastrar-piloto.js';
import type { ConsultarCarreira } from '../../application/pilotos/consultar-carreira.js';
import type { FotosDosPilotos } from '../../application/pilotos/fotos-dos-pilotos.js';
import type { ExcluirPiloto } from '../../application/pilotos/excluir-piloto.js';
import type { ListarPilotos } from '../../application/pilotos/listar-pilotos.js';
import type { ObterPiloto } from '../../application/pilotos/obter-piloto.js';
import { apresentarPaginaDePilotos, apresentarPiloto } from './apresentadores.js';

export interface CasosDeUsoDePilotos {
  listar: ListarPilotos;
  obter: ObterPiloto;
  cadastrar: CadastrarPiloto;
  atualizar: AtualizarPiloto;
  excluir: ExcluirPiloto;
  carreira: ConsultarCarreira;
  fotos: FotosDosPilotos;
}

const parametros = z.object({ id: z.uuid() });

export const rotasPilotos: FastifyPluginAsyncZod<CasosDeUsoDePilotos> = async (app, casos) => {
  app.get(
    '/',
    {
      schema: {
        querystring: listarPilotosQuerySchema,
        response: { 200: paginaDePilotosSchema },
      },
    },
    async (request) => apresentarPaginaDePilotos(await casos.listar.executar(request.query)),
  );

  app.get(
    '/fotos',
    { schema: { response: { 200: fotosDosPilotosSchema } } },
    async (_request, reply) => {
      reply.header('cache-control', 'public, max-age=3600');

      return casos.fotos.executar();
    },
  );

  app.get(
    '/:id/carreira',
    { schema: { params: parametros, response: { 200: carreiraSchema, 404: erroSchema } } },
    async (request, reply) => {
      reply.header('cache-control', 'public, max-age=3600');

      return casos.carreira.executar(request.params.id);
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        params: parametros,
        response: { 200: pilotoSchema, 404: erroSchema },
      },
    },
    async (request) => apresentarPiloto(await casos.obter.executar(request.params.id)),
  );

  app.post(
    '/',
    {
      schema: {
        body: dadosPilotoSchema,
        response: { 201: pilotoSchema, 409: erroSchema, 422: erroSchema },
      },
    },
    async (request, reply) => {
      const piloto = await casos.cadastrar.executar(request.body);

      return reply.status(201).send(apresentarPiloto(piloto));
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        params: parametros,
        body: dadosPilotoSchema,
        response: { 200: pilotoSchema, 404: erroSchema, 409: erroSchema, 422: erroSchema },
      },
    },
    async (request) =>
      apresentarPiloto(await casos.atualizar.executar(request.params.id, request.body)),
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: parametros,
        response: { 204: z.null(), 404: erroSchema },
      },
    },
    async (request, reply) => {
      await casos.excluir.executar(request.params.id);

      return reply.status(204).send(null);
    },
  );
};
