import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { Campeonato } from '../../src/application/ports/fonte-do-campeonato.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { configuracaoDeTeste } from '../support/autenticacao.js';

let app: FastifyInstance;

const campeonato: Campeonato = {
  ano: 2026,
  totalDeRodadas: 23,
  rodadasDisputadas: 20,
  proximaCorrida: {
    rodada: 21,
    nome: 'Las Vegas Grand Prix',
    circuito: 'Las Vegas Strip Street Circuit',
    cidade: 'Las Vegas',
    pais: 'USA',
    inicio: new Date('2026-11-22T04:00:00Z'),
    sessoes: [{ nome: 'Corrida', inicio: new Date('2026-11-22T04:00:00Z') }],
  },
  pilotos: [{ posicao: 1, nome: 'Kimi Antonelli', equipe: 'Mercedes', pontos: 390, vitorias: 9 }],
  construtores: [{ posicao: 1, nome: 'Mercedes', pontos: 652, vitorias: 12 }],
  ultimaCorrida: null,
};

async function criarApp(sobrescrita: Partial<typeof configuracaoDeTeste>) {
  const equipes = new EquipeRepositoryEmMemoria();
  app = await buildApp(
    { equipes, pilotos: new PilotoRepositoryEmMemoria(equipes) },
    { ...configuracaoDeTeste, ...sobrescrita },
  );
}

afterEach(() => app.close());

describe('GET /painel', () => {
  it('é público e devolve campeonato e notícias com cache no navegador', async () => {
    await criarApp({
      campeonato: { buscarCampeonato: async () => campeonato },
      noticias: {
        buscarNoticias: async () => [
          {
            titulo: 'Antiga',
            link: 'https://br.motorsport.com/a',
            fonte: 'Motorsport.com Brasil',
            publicadaEm: new Date('2026-11-01T00:00:00Z'),
          },
          {
            titulo: 'Nova',
            link: 'https://br.motorsport.com/b',
            fonte: 'Motorsport.com Brasil',
            publicadaEm: new Date('2026-11-10T00:00:00Z'),
          },
        ],
      },
    });

    const resposta = await app.inject({ method: 'GET', url: '/painel' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['cache-control']).toBe('public, max-age=120');
    expect(resposta.json()).toMatchObject({
      campeonato: {
        proximaCorrida: { nome: 'Las Vegas Grand Prix', inicio: '2026-11-22T04:00:00.000Z' },
      },
      noticias: [{ titulo: 'Nova' }, { titulo: 'Antiga' }],
    });
  });

  it('continua respondendo quando uma das fontes falha', async () => {
    await criarApp({
      campeonato: { buscarCampeonato: () => Promise.reject(new Error('fora do ar')) },
    });

    const resposta = await app.inject({ method: 'GET', url: '/painel' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({ campeonato: null, noticias: [] });
  });
});
