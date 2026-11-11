import { usarMensagensEmPortugues } from '@drs/contracts';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { AtualizarEquipe } from './application/equipes/atualizar-equipe.js';
import { CadastrarEquipe } from './application/equipes/cadastrar-equipe.js';
import { ListarEquipes } from './application/equipes/listar-equipes.js';
import { AtualizarPiloto } from './application/pilotos/atualizar-piloto.js';
import { CadastrarPiloto } from './application/pilotos/cadastrar-piloto.js';
import { ExcluirPiloto } from './application/pilotos/excluir-piloto.js';
import { ListarPilotos } from './application/pilotos/listar-pilotos.js';
import { ObterPiloto } from './application/pilotos/obter-piloto.js';
import type { EquipeRepository } from './application/ports/equipe-repository.js';
import type { PilotoRepository } from './application/ports/piloto-repository.js';
import { rotasEquipes } from './infra/http/rotas-equipes.js';
import { rotasPilotos } from './infra/http/rotas-pilotos.js';
import { tratarErros } from './infra/http/tratar-erros.js';

export interface Repositorios {
  pilotos: PilotoRepository;
  equipes: EquipeRepository;
}

export async function buildApp(
  { pilotos, equipes }: Repositorios,
  options: FastifyServerOptions = {},
) {
  usarMensagensEmPortugues();

  const app = Fastify(options);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  tratarErros(app);
  await app.register(helmet);

  app.get('/health', () => ({ status: 'ok' }));

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

  return app;
}
