import { usarMensagensEmPortugues } from '@drs/contracts';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { AtualizarEquipe } from './application/equipes/atualizar-equipe.js';
import { CadastrarEquipe } from './application/equipes/cadastrar-equipe.js';
import { ImportarTemporada } from './application/importacao/importar-temporada.js';
import { ListarEquipes } from './application/equipes/listar-equipes.js';
import { AtualizarPiloto } from './application/pilotos/atualizar-piloto.js';
import { CadastrarPiloto } from './application/pilotos/cadastrar-piloto.js';
import { ExcluirPiloto } from './application/pilotos/excluir-piloto.js';
import { ListarPilotos } from './application/pilotos/listar-pilotos.js';
import { ObterPiloto } from './application/pilotos/obter-piloto.js';
import type { EquipeRepository } from './application/ports/equipe-repository.js';
import type { FonteDeDadosDaF1 } from './application/ports/fonte-de-dados-da-f1.js';
import type { PilotoRepository } from './application/ports/piloto-repository.js';
import {
  type ConfiguracaoDeAutenticacao,
  exigirSessaoNasEscritas,
  rotasDeSessao,
} from './infra/http/autenticacao.js';
import { rotasEquipes } from './infra/http/rotas-equipes.js';
import { rotasImportacao } from './infra/http/rotas-importacao.js';
import { rotasPilotos } from './infra/http/rotas-pilotos.js';
import { tratarErros } from './infra/http/tratar-erros.js';

export interface Repositorios {
  pilotos: PilotoRepository;
  equipes: EquipeRepository;
}

export interface ConfiguracaoDoApp {
  autenticacao: ConfiguracaoDeAutenticacao;
  fonteDeDados: FonteDeDadosDaF1;
  origensPermitidas?: string[];
}

const TAMANHO_MAXIMO_DO_CORPO = 16 * 1024;

export async function buildApp(
  { pilotos, equipes }: Repositorios,
  { autenticacao, fonteDeDados, origensPermitidas = [] }: ConfiguracaoDoApp,
  options: FastifyServerOptions = {},
) {
  usarMensagensEmPortugues();

  const app = Fastify({ bodyLimit: TAMANHO_MAXIMO_DO_CORPO, ...options });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  tratarErros(app);
  await app.register(helmet);
  await app.register(cors, {
    origin: origensPermitidas,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['content-type', 'authorization'],
  });
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      code: 'MUITAS_REQUISICOES',
      message: 'Muitas requisições. Aguarde um pouco e tente de novo.',
    }),
  });
  exigirSessaoNasEscritas(app, autenticacao);

  app.get('/health', () => ({ status: 'ok' }));

  await app.register(rotasDeSessao, autenticacao);

  await app.register(rotasPilotos, {
    prefix: '/pilotos',
    listar: new ListarPilotos(pilotos),
    obter: new ObterPiloto(pilotos),
    cadastrar: new CadastrarPiloto(pilotos, equipes),
    atualizar: new AtualizarPiloto(pilotos, equipes),
    excluir: new ExcluirPiloto(pilotos),
  });

  await app.register(rotasEquipes, {
    prefix: '/equipes',
    listar: new ListarEquipes(equipes),
    cadastrar: new CadastrarEquipe(equipes),
    atualizar: new AtualizarEquipe(equipes),
  });

  await app.register(rotasImportacao, {
    prefix: '/importacoes',
    importar: new ImportarTemporada(pilotos, equipes, fonteDeDados),
  });

  return app;
}
