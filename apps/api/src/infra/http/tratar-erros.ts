import type { ErroDTO } from '@drs/contracts';
import type { FastifyError, FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { type CodigoDeErro, ErroDeDominio } from '../../domain/erros.js';

const statusPorCodigo: Record<CodigoDeErro, number> = {
  PILOTO_NAO_ENCONTRADO: 404,
  EQUIPE_NAO_ENCONTRADA: 404,
  EQUIPE_INVALIDA: 422,
  NUMERO_JA_EM_USO: 409,
  EQUIPE_JA_EXISTE: 409,
  ETAPA_NAO_ENCONTRADA: 404,
};

export function tratarErros(app: FastifyInstance) {
  app.setErrorHandler((erro: FastifyError, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(erro)) {
      const campos: Record<string, string[]> = {};

      for (const { instancePath, message } of erro.validation) {
        const campo = instancePath.replace(/^\//, '').replaceAll('/', '.') || 'requisicao';
        (campos[campo] ??= []).push(message ?? 'Valor inválido');
      }

      return reply.status(400).send({
        codigo: 'DADOS_INVALIDOS',
        mensagem: 'Os dados enviados são inválidos.',
        campos,
      } satisfies ErroDTO);
    }

    if (erro instanceof ErroDeDominio) {
      return reply
        .status(statusPorCodigo[erro.codigo])
        .send({ codigo: erro.codigo, mensagem: erro.message } satisfies ErroDTO);
    }

    if (erro.statusCode && erro.statusCode < 500) {
      return reply
        .status(erro.statusCode)
        .send({ codigo: erro.code, mensagem: erro.message } satisfies ErroDTO);
    }

    request.log.error(erro);

    return reply
      .status(500)
      .send({ codigo: 'ERRO_INTERNO', mensagem: 'Erro inesperado no servidor.' } satisfies ErroDTO);
  });

  app.setNotFoundHandler((_request, reply) =>
    reply
      .status(404)
      .send({ codigo: 'ROTA_NAO_ENCONTRADA', mensagem: 'Rota não encontrada.' } satisfies ErroDTO),
  );
}
