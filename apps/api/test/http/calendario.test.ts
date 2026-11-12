import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { Corrida } from '../../src/application/ports/fonte-do-campeonato.js';
import {
  CampeoesRepositoryEmMemoria,
  EquipeRepositoryEmMemoria,
  ImportacaoRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { configuracaoDeTeste } from '../support/autenticacao.js';

let app: FastifyInstance;

const corrida: Corrida = {
  rodada: 20,
  nome: 'São Paulo Grand Prix',
  circuito: 'Autódromo José Carlos Pace',
  cidade: 'São Paulo',
  pais: 'Brazil',
  inicio: new Date('2026-11-08T17:00:00Z'),
  sessoes: [{ nome: 'Corrida', inicio: new Date('2026-11-08T17:00:00Z') }],
};

async function criarApp() {
  const equipes = new EquipeRepositoryEmMemoria();
  app = await buildApp(
    {
      equipes,
      pilotos: new PilotoRepositoryEmMemoria(equipes),
      importacoes: new ImportacaoRepositoryEmMemoria(),
      campeoes: new CampeoesRepositoryEmMemoria(),
    },
    {
      ...configuracaoDeTeste,
      campeonato: {
        ...configuracaoDeTeste.campeonato,
        buscarCalendario: async () => [
          { ...corrida, vencedor: { nome: 'Lando Norris', equipe: 'McLaren' } },
        ],
        buscarResultado: async (rodada) =>
          rodada === 20
            ? {
                etapa: corrida,
                sprint: [],
                qualificacao: [
                  {
                    posicao: 1,
                    nome: 'Lando Norris',
                    numero: 1,
                    equipe: 'McLaren',
                    q1: '1:30.939',
                    q2: '1:29.207',
                    q3: '1:27.470',
                  },
                ],
                classificacao: [
                  {
                    posicao: 1,
                    classificado: true,
                    nome: 'Lando Norris',
                    numero: 1,
                    equipe: 'McLaren',
                    largada: 2,
                    voltas: 71,
                    tempo: '1:32:10.512',
                    situacao: 'Completou',
                    pontos: 25,
                    voltaMaisRapida: true,
                  },
                ],
              }
            : null,
      },
    },
  );
}

afterEach(() => app.close());

describe('GET /calendario', () => {
  it('lista as etapas com datas em ISO e cache no navegador', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/calendario' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['cache-control']).toBe('public, max-age=300');
    expect(resposta.json()).toEqual([
      expect.objectContaining({
        rodada: 20,
        inicio: '2026-11-08T17:00:00.000Z',
        vencedor: { nome: 'Lando Norris', equipe: 'McLaren' },
      }),
    ]);
  });
});

describe('GET /calendario/:rodada', () => {
  it('devolve a classificação da etapa', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/calendario/20' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({
      etapa: { nome: 'São Paulo Grand Prix' },
      classificacao: [{ posicao: 1, voltaMaisRapida: true }],
      sprint: [],
      qualificacao: [{ posicao: 1, q3: '1:27.470' }],
    });
  });

  it('responde 404 para etapa fora do calendário', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/calendario/22' });

    expect(resposta.statusCode).toBe(404);
    expect(resposta.json()).toMatchObject({ codigo: 'ETAPA_NAO_ENCONTRADA' });
  });

  it('rejeita rodada inválida', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/calendario/abc' });

    expect(resposta.statusCode).toBe(400);
  });
});

describe('GET /temporada/pilotos', () => {
  it('é pública e devolve o desempenho de cada piloto', async () => {
    await criarApp();

    const resposta = await app.inject({ method: 'GET', url: '/temporada/pilotos' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['cache-control']).toBe('public, max-age=300');
    expect(resposta.json()).toEqual({ ano: 2026, rodadasDisputadas: 0, pilotos: [] });
  });
});
