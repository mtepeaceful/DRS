import { erroSchema, resultadoDaImportacaoSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { ImportarTemporada } from '../../application/importacao/importar-temporada.js';
import { FonteIndisponivel } from '../f1/fonte-jolpica-openf1.js';

export const rotasImportacao: FastifyPluginAsyncZod<{ importar: ImportarTemporada }> = async (
  app,
  { importar },
) => {
  app.post(
    '/temporada-atual',
    {
      config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
      schema: { response: { 200: resultadoDaImportacaoSchema, 502: erroSchema } },
    },
    async (request, reply) => {
      try {
        return await importar.executar();
      } catch (erro) {
        if (!(erro instanceof FonteIndisponivel)) {
          throw erro;
        }

        request.log.warn(erro);

        return reply.status(502).send({ codigo: 'FONTE_INDISPONIVEL', mensagem: erro.message });
      }
    },
  );
};
