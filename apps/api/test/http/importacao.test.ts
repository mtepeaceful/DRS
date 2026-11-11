import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { FonteDeDadosDaF1 } from '../../src/application/ports/fonte-de-dados-da-f1.js';
import { FonteIndisponivel } from '../../src/infra/f1/fonte-jolpica-openf1.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { cabecalhoDeSessao, configuracaoDeTeste } from '../support/autenticacao.js';

let app: FastifyInstance;

async function criarApp(fonteDeDados: FonteDeDadosDaF1) {
  const equipes = new EquipeRepositoryEmMemoria();
  app = await buildApp(
    { equipes, pilotos: new PilotoRepositoryEmMemoria(equipes) },
    { ...configuracaoDeTeste, fonteDeDados },
  );
}

afterEach(() => app.close());

const fonte: FonteDeDadosDaF1 = {
  buscarTemporadaAtual: async () => ({
    ano: 2026,
    equipes: [{ nome: 'Ferrari', cor: '#ed1131', corSecundaria: '#ffffff' }],
    pilotos: [{ nome: 'Lewis Hamilton', numero: 44, pais: 'GB', titulos: 7, equipe: 'Ferrari' }],
  }),
};

function importar(headers: Record<string, string> = cabecalhoDeSessao) {
  return app.inject({ method: 'POST', url: '/importacoes/temporada-atual', headers });
}

describe('POST /importacoes/temporada-atual', () => {
  it('exige sessão de administrador', async () => {
    await criarApp(fonte);

    expect((await importar({})).statusCode).toBe(401);
  });

  it('importa e devolve o resumo', async () => {
    await criarApp(fonte);

    const resposta = await importar();
    const grid = await app.inject({ method: 'GET', url: '/pilotos' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ ano: 2026, pilotos: { criados: 1 } });
    expect(grid.json()).toMatchObject({ total: 1, itens: [{ nome: 'Lewis Hamilton' }] });
  });

  it('responde 502 quando a fonte está fora do ar', async () => {
    await criarApp({
      buscarTemporadaAtual: async () => {
        throw new FonteIndisponivel('https://api.openf1.org/v1/drivers', new Error('timeout'));
      },
    });

    const resposta = await importar();

    expect(resposta.statusCode).toBe(502);
    expect(resposta.json()).toMatchObject({ codigo: 'FONTE_INDISPONIVEL' });
  });

  it('limita a 3 importações por hora', async () => {
    await criarApp(fonte);

    for (let i = 0; i < 3; i++) {
      await importar();
    }

    expect((await importar()).statusCode).toBe(429);
  });
});
