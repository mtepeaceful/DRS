import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import {
  CampeoesRepositoryEmMemoria,
  EquipeRepositoryEmMemoria,
  ImportacaoRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { configuracaoDeTeste } from '../support/autenticacao.js';

let app: FastifyInstance;

async function criarApp() {
  const equipes = new EquipeRepositoryEmMemoria();
  const campeoes = new CampeoesRepositoryEmMemoria();
  await campeoes.guardar([
    {
      ano: 1988,
      sigla: 'SEN',
      piloto: 'Ayrton Senna',
      pais: 'BR',
      equipe: 'McLaren',
      pontos: 90,
      vitorias: 8,
      construtor: { nome: 'McLaren', pontos: 199, vitorias: 15 },
    },
  ]);
  app = await buildApp(
    {
      equipes,
      pilotos: new PilotoRepositoryEmMemoria(equipes),
      importacoes: new ImportacaoRepositoryEmMemoria(),
      campeoes,
    },
    {
      ...configuracaoDeTeste,
      historia: {
        buscarCampeoes: async () => [],
        buscarTemporada: async (ano) => ({ ano, corridas: [], pilotos: [], construtores: [] }),
      },
    },
  );
}

afterEach(() => app.close());

describe('GET /historia/campeoes', () => {
  it('é pública, lista os campeões guardados e avisa quantas temporadas faltam', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/historia/campeoes' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['cache-control']).toBe('public, max-age=60');
    expect(resposta.json()).toMatchObject({
      temporadas: [{ ano: 1988, piloto: 'Ayrton Senna', construtor: { nome: 'McLaren' } }],
      maioresPilotos: [{ nome: 'Ayrton Senna', titulos: 1, anos: [1988] }],
    });
    expect(resposta.json().faltando).toBeGreaterThan(70);
  });
});

describe('GET /historia/:ano', () => {
  it('devolve uma temporada encerrada', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/historia/1988' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({ ano: 1988, corridas: [], pilotos: [], construtores: [] });
  });

  it('responde 404 para a temporada em andamento', async () => {
    await criarApp();

    const resposta = await app.inject({
      method: 'GET',
      url: `/historia/${new Date().getUTCFullYear()}`,
    });

    expect(resposta.statusCode).toBe(404);
    expect(resposta.json()).toMatchObject({ codigo: 'TEMPORADA_NAO_ENCONTRADA' });
  });

  it('rejeita ano fora do formato', async () => {
    await criarApp();

    expect((await app.inject({ method: 'GET', url: '/historia/1900' })).statusCode).toBe(400);
    expect((await app.inject({ method: 'GET', url: '/historia/abc' })).statusCode).toBe(400);
  });
});
