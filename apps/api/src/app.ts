import { usarMensagensEmPortugues } from '@drs/contracts';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { ConsultarCalendario } from './application/calendario/consultar-calendario.js';
import { ConsultarCircuitos } from './application/circuitos/consultar-circuitos.js';
import { ConsultarDesempenho } from './application/desempenho/consultar-desempenho.js';
import { AtualizarEquipe } from './application/equipes/atualizar-equipe.js';
import { CadastrarEquipe } from './application/equipes/cadastrar-equipe.js';
import { ConsultarDicionario } from './application/equipes/consultar-dicionario.js';
import { ImportarTemporada } from './application/importacao/importar-temporada.js';
import { ManterGridAtualizado } from './application/importacao/manter-grid-atualizado.js';
import {
  CampeoesDaHistoria,
  temporadasEncerradas,
} from './application/historia/campeoes-da-historia.js';
import { ConsultarHistoria } from './application/historia/consultar-historia.js';
import { ConsultarPilotosDaHistoria } from './application/historia/consultar-pilotos-da-historia.js';
import { MontarPainel } from './application/painel/montar-painel.js';
import { ListarEquipes } from './application/equipes/listar-equipes.js';
import { AtualizarPiloto } from './application/pilotos/atualizar-piloto.js';
import { CadastrarPiloto } from './application/pilotos/cadastrar-piloto.js';
import { ConsultarCarreira } from './application/pilotos/consultar-carreira.js';
import { FotosDosPilotos } from './application/pilotos/fotos-dos-pilotos.js';
import { ExcluirPiloto } from './application/pilotos/excluir-piloto.js';
import { ListarPilotos } from './application/pilotos/listar-pilotos.js';
import { ObterPiloto } from './application/pilotos/obter-piloto.js';
import type { CampeoesRepository } from './application/ports/campeoes-repository.js';
import type { EquipeRepository } from './application/ports/equipe-repository.js';
import type { FonteDaHistoria } from './application/ports/fonte-da-historia.js';
import type { Enciclopedia, FonteDasEquipes } from './application/ports/fonte-das-equipes.js';
import type { FonteDosCircuitos } from './application/ports/fonte-dos-circuitos.js';
import type { FonteDeDadosDaF1 } from './application/ports/fonte-de-dados-da-f1.js';
import type { FonteDeNoticias } from './application/ports/fonte-de-noticias.js';
import type { FonteDoCampeonato } from './application/ports/fonte-do-campeonato.js';
import type { ImportacaoRepository } from './application/ports/importacao-repository.js';
import type { PilotoRepository } from './application/ports/piloto-repository.js';
import { agendarTarefas } from './infra/agendar-tarefas.js';
import {
  type ConfiguracaoDeAutenticacao,
  exigirSessaoNasEscritas,
  rotasDeSessao,
} from './infra/http/autenticacao.js';
import { rotasCalendario } from './infra/http/rotas-calendario.js';
import { rotasCircuitos } from './infra/http/rotas-circuitos.js';
import { rotasDicionario } from './infra/http/rotas-dicionario.js';
import { rotasDesempenho } from './infra/http/rotas-desempenho.js';
import { rotasEquipes } from './infra/http/rotas-equipes.js';
import { rotasHistoria } from './infra/http/rotas-historia.js';
import { rotasImportacao } from './infra/http/rotas-importacao.js';
import { rotasPainel } from './infra/http/rotas-painel.js';
import { rotasPilotosDaHistoria } from './infra/http/rotas-pilotos-da-historia.js';
import { rotasPilotos } from './infra/http/rotas-pilotos.js';
import { tratarErros } from './infra/http/tratar-erros.js';

export interface Repositorios {
  pilotos: PilotoRepository;
  equipes: EquipeRepository;
  importacoes: ImportacaoRepository;
  campeoes: CampeoesRepository;
}

export interface ConfiguracaoDoApp {
  autenticacao: ConfiguracaoDeAutenticacao;
  fonteDeDados: FonteDeDadosDaF1;
  historia: FonteDaHistoria;
  equipesDaHistoria: FonteDasEquipes;
  circuitos: FonteDosCircuitos;
  enciclopedia: Enciclopedia;
  campeonato: FonteDoCampeonato;
  noticias: FonteDeNoticias;
  origensPermitidas?: string[];
  tarefasEmSegundoPlano?: boolean;
}

const TAMANHO_MAXIMO_DO_CORPO = 16 * 1024;

export async function buildApp(
  { pilotos, equipes, importacoes, campeoes }: Repositorios,
  {
    autenticacao,
    fonteDeDados,
    historia,
    equipesDaHistoria,
    circuitos,
    enciclopedia,
    campeonato,
    noticias,
    origensPermitidas = [],
    tarefasEmSegundoPlano = false,
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
    carreira: new ConsultarCarreira(pilotos, campeoes, historia),
    fotos: new FotosDosPilotos(pilotos, historia, enciclopedia),
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

  const campeoesDaHistoria = new CampeoesDaHistoria(campeoes, historia);
  const importar = new ImportarTemporada(
    pilotos,
    equipes,
    importacoes,
    campeoesDaHistoria,
    fonteDeDados,
  );

  await app.register(rotasImportacao, { prefix: '/importacoes', importar });
  await app.register(rotasCircuitos, {
    prefix: '/circuitos',
    circuitos: new ConsultarCircuitos(circuitos, enciclopedia, campeonato),
  });
  await app.register(rotasPilotosDaHistoria, {
    prefix: '/historia/pilotos',
    pilotos: new ConsultarPilotosDaHistoria(historia, campeoes, enciclopedia),
  });
  await app.register(rotasDicionario, {
    prefix: '/historia/equipes',
    dicionario: new ConsultarDicionario(equipesDaHistoria, enciclopedia, campeoes, campeonato),
  });
  await app.register(rotasHistoria, {
    prefix: '/historia',
    historia: new ConsultarHistoria(campeoes, historia),
  });

  if (tarefasEmSegundoPlano) {
    const manterGrid = new ManterGridAtualizado(importar, importacoes);

    agendarTarefas(app, [
      {
        descricao: 'Campeões da história atualizados',
        primeiraEmMs: 5_000,
        executar: async () => {
          const { novos } = await campeoesDaHistoria.garantir(temporadasEncerradas(new Date()));

          return novos > 0 ? { temporadas: novos } : null;
        },
      },
      {
        descricao: 'Grid atualizado automaticamente',
        primeiraEmMs: 15_000,
        executar: async () => {
          const resultado = await manterGrid.executarSeNecessario(new Date());

          return (
            resultado && {
              ano: resultado.ano,
              criados: resultado.pilotos.criados,
              atualizados: resultado.pilotos.atualizados,
              ignorados: resultado.pilotos.ignorados.length,
            }
          );
        },
      },
    ]);
  }

  return app;
}
