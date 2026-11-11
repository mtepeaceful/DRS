import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/env.js';
import { criarRepositorios } from '../../src/infra/criar-repositorios.js';
import { EquipeRepositoryDrizzle } from '../../src/infra/database/equipe-repository-drizzle.js';
import { PilotoRepositoryDrizzle } from '../../src/infra/database/piloto-repository-drizzle.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

describe('loadEnv', () => {
  it('usa o PostgreSQL quando o armazenamento não é informado', () => {
    const env = loadEnv({ DATABASE_URL: 'postgres://drs:senha@localhost:5433/drs' });

    expect(env).toMatchObject({ ARMAZENAMENTO: 'postgres', PORT: 3333 });
  });

  it('exige DATABASE_URL no PostgreSQL', () => {
    expect(() => loadEnv({ ARMAZENAMENTO: 'postgres' })).toThrow();
  });

  it('dispensa DATABASE_URL no modo memória', () => {
    expect(loadEnv({ ARMAZENAMENTO: 'memoria' })).toMatchObject({ ARMAZENAMENTO: 'memoria' });
  });

  it('recusa um armazenamento desconhecido', () => {
    expect(() => loadEnv({ ARMAZENAMENTO: 'mysql' })).toThrow();
  });
});

describe('criarRepositorios', () => {
  it('cria os repositórios em memória, ligados entre si', async () => {
    const { repositorios, fechar } = criarRepositorios({ ARMAZENAMENTO: 'memoria' });

    expect(repositorios.equipes).toBeInstanceOf(EquipeRepositoryEmMemoria);
    expect(repositorios.pilotos).toBeInstanceOf(PilotoRepositoryEmMemoria);

    const equipe = await repositorios.equipes.criar(dadosDaEquipe('Ferrari'));
    const piloto = await repositorios.pilotos.criar({
      nome: 'Charles Leclerc',
      numero: 16,
      pais: 'MC',
      equipeId: equipe.id,
      titulos: 0,
    });

    expect(piloto.equipe).toEqual(equipe);
    await fechar();
  });

  it('cria os repositórios PostgreSQL sem abrir conexão antes da primeira consulta', async () => {
    const { repositorios, fechar } = criarRepositorios({
      ARMAZENAMENTO: 'postgres',
      DATABASE_URL: 'postgres://drs:senha@localhost:1/drs',
    });

    expect(repositorios.equipes).toBeInstanceOf(EquipeRepositoryDrizzle);
    expect(repositorios.pilotos).toBeInstanceOf(PilotoRepositoryDrizzle);
    await fechar();
  });
});
