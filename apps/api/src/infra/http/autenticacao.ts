import { entrarSchema, erroSchema, sessaoSchema } from '@drs/contracts';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { senhaConfere } from '../seguranca/senha.js';
import { emitirToken, tokenValido } from '../seguranca/sessao.js';

export interface ConfiguracaoDeAutenticacao {
  hashDaSenha: string;
  segredo: string;
}

const METODOS_DE_ESCRITA = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ROTAS_PUBLICAS_DE_ESCRITA = new Set(['/sessao']);

export function exigirSessaoNasEscritas(
  app: FastifyInstance,
  { segredo }: ConfiguracaoDeAutenticacao,
) {
  app.addHook('onRequest', async (request, reply) => {
    if (
      !METODOS_DE_ESCRITA.has(request.method) ||
      ROTAS_PUBLICAS_DE_ESCRITA.has(request.routeOptions.url ?? '')
    ) {
      return;
    }

    const [tipo, token] = (request.headers.authorization ?? '').split(' ');

    if (tipo !== 'Bearer' || !token || !tokenValido(token, segredo)) {
      return reply
        .status(401)
        .send({ codigo: 'NAO_AUTENTICADO', mensagem: 'Entre como administrador para continuar.' });
    }
  });
}

export const rotasDeSessao: FastifyPluginAsyncZod<ConfiguracaoDeAutenticacao> = async (
  app,
  { hashDaSenha, segredo },
) => {
  app.post(
    '/sessao',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        body: entrarSchema,
        response: { 201: sessaoSchema, 401: erroSchema },
      },
    },
    async (request, reply) => {
      if (!(await senhaConfere(request.body.senha, hashDaSenha))) {
        return reply.status(401).send({ codigo: 'SENHA_INCORRETA', mensagem: 'Senha incorreta.' });
      }

      const { token, expiraEm } = emitirToken(segredo);

      return reply.status(201).send({ token, expiraEm: expiraEm.toISOString() });
    },
  );
};
