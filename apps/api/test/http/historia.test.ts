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
        listarPilotos: async () => [],
        buscarCarreira: () => Promise.reject(new Error('não usado')),
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

describe('GET /historia/equipes', () => {
  it('lista as equipes e devolve 404 para uma equipe que não existe', async () => {
    await criarApp();

    const lista = await app.inject({ method: 'GET', url: '/historia/equipes' });
    const inexistente = await app.inject({ method: 'GET', url: '/historia/equipes/inventada' });
    const invalida = await app.inject({ method: 'GET', url: '/historia/equipes/%3Cscript%3E' });

    expect(lista.statusCode).toBe(200);
    expect(lista.headers['cache-control']).toBe('public, max-age=3600');
    expect(lista.json()).toEqual([]);
    expect(inexistente.statusCode).toBe(404);
    expect(inexistente.json()).toMatchObject({ codigo: 'EQUIPE_NAO_ENCONTRADA' });
    expect(invalida.statusCode).toBe(400);
  });
});

describe('GET /circuitos', () => {
  it('é pública e responde 404 para circuito inexistente', async () => {
    await criarApp();

    const lista = await app.inject({ method: 'GET', url: '/circuitos' });
    const inexistente = await app.inject({ method: 'GET', url: '/circuitos/inventado' });

    expect(lista.statusCode).toBe(200);
    expect(lista.json()).toEqual([]);
    expect(inexistente.statusCode).toBe(404);
    expect(inexistente.json()).toMatchObject({ codigo: 'CIRCUITO_NAO_ENCONTRADO' });
  });
});

describe('GET /historia/pilotos', () => {
  it('é pública e responde 404 para piloto inexistente', async () => {
    await criarApp();

    const lista = await app.inject({ method: 'GET', url: '/historia/pilotos' });
    const inexistente = await app.inject({ method: 'GET', url: '/historia/pilotos/inventado' });

    expect(lista.statusCode).toBe(200);
    expect(lista.json()).toEqual([]);
    expect(inexistente.statusCode).toBe(404);
  });
});
