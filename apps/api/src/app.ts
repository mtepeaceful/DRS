import { usarMensagensEmPortugues } from '@drs/contracts';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { ConsultarCalendario } from './application/calendario/consultar-calendario.js';
import { ConsultarDesempenho } from './application/desempenho/consultar-desempenho.js';
import { AtualizarEquipe } from './application/equipes/atualizar-equipe.js';
import { CadastrarEquipe } from './application/equipes/cadastrar-equipe.js';
import { ImportarTemporada } from './application/importacao/importar-temporada.js';
import { ManterGridAtualizado } from './application/importacao/manter-grid-atualizado.js';
import { MontarPainel } from './application/painel/montar-painel.js';
import { ListarEquipes } from './application/equipes/listar-equipes.js';
import { AtualizarPiloto } from './application/pilotos/atualizar-piloto.js';
import { CadastrarPiloto } from './application/pilotos/cadastrar-piloto.js';
import { ExcluirPiloto } from './application/pilotos/excluir-piloto.js';
import { ListarPilotos } from './application/pilotos/listar-pilotos.js';
import { ObterPiloto } from './application/pilotos/obter-piloto.js';
import type { EquipeRepository } from './application/ports/equipe-repository.js';
import type { FonteDeDadosDaF1 } from './application/ports/fonte-de-dados-da-f1.js';
import type { FonteDeNoticias } from './application/ports/fonte-de-noticias.js';
import type { FonteDoCampeonato } from './application/ports/fonte-do-campeonato.js';
import type { ImportacaoRepository } from './application/ports/importacao-repository.js';
import type { PilotoRepository } from './application/ports/piloto-repository.js';
import { agendarAtualizacaoDoGrid } from './infra/agendar-atualizacao-do-grid.js';
import {
  type ConfiguracaoDeAutenticacao,
  exigirSessaoNasEscritas,
  rotasDeSessao,
} from './infra/http/autenticacao.js';
import { rotasCalendario } from './infra/http/rotas-calendario.js';
import { rotasDesempenho } from './infra/http/rotas-desempenho.js';
import { rotasEquipes } from './infra/http/rotas-equipes.js';
import { rotasImportacao } from './infra/http/rotas-importacao.js';
import { rotasPainel } from './infra/http/rotas-painel.js';
import { rotasPilotos } from './infra/http/rotas-pilotos.js';
import { tratarErros } from './infra/http/tratar-erros.js';

export interface Repositorios {
  pilotos: PilotoRepository;
  equipes: EquipeRepository;
  importacoes: ImportacaoRepository;
}

export interface ConfiguracaoDoApp {
  autenticacao: ConfiguracaoDeAutenticacao;
  fonteDeDados: FonteDeDadosDaF1;
  campeonato: FonteDoCampeonato;
  noticias: FonteDeNoticias;
  origensPermitidas?: string[];
  atualizarGridSozinho?: boolean;
}

const TAMANHO_MAXIMO_DO_CORPO = 16 * 1024;

export async function buildApp(
  { pilotos, equipes, importacoes }: Repositorios,
  {
    autenticacao,
    fonteDeDados,
    campeonato,
    noticias,
    origensPermitidas = [],
    atualizarGridSozinho = false,
  }: ConfiguracaoDoApp,
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

  await app.register(rotasPainel, { montar: new MontarPainel(campeonato, noticias) });
  await app.register(rotasCalendario, {
    prefix: '/calendario',
    calendario: new ConsultarCalendario(campeonato),
  });
  await app.register(rotasDesempenho, {
    prefix: '/temporada',
    desempenho: new ConsultarDesempenho(campeonato),
  });

  const importar = new ImportarTemporada(pilotos, equipes, importacoes, fonteDeDados);

  await app.register(rotasImportacao, { prefix: '/importacoes', importar });

  if (atualizarGridSozinho) {
    agendarAtualizacaoDoGrid(app, new ManterGridAtualizado(importar, importacoes));
  }

  return app;
}
