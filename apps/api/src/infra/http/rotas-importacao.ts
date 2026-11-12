import { erroSchema, resultadoDaImportacaoSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { ImportarTemporada } from '../../application/importacao/importar-temporada.js';

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
    async () => importar.executar(),
  );
};
