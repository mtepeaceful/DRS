import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { Equipe } from '../../src/domain/equipe.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

let app: FastifyInstance;
let mclaren: Equipe;

function corpoDoPiloto(sobrescrita: Record<string, unknown> = {}) {
  return {
    nome: 'Ayrton Senna',
    numero: 12,
    pais: 'BR',
    equipeId: mclaren.id,
    titulos: 3,
    ...sobrescrita,
  };
}

async function cadastrar(sobrescrita: Record<string, unknown> = {}) {
  const resposta = await app.inject({
    method: 'POST',
    url: '/pilotos',
    payload: corpoDoPiloto(sobrescrita),
  });

  return resposta.json<{ id: string }>();
}

beforeEach(async () => {
  const equipes = new EquipeRepositoryEmMemoria();
  mclaren = await equipes.criar(dadosDaEquipe('McLaren'));
  app = await buildApp({ equipes, pilotos: new PilotoRepositoryEmMemoria(equipes) });
});

afterEach(() => app.close());

describe('GET /health', () => {
  it('responde que a API está no ar', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/health' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({ status: 'ok' });
  });
});

describe('POST /pilotos', () => {
  it('cadastra e devolve o piloto com a equipe', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/pilotos',
      payload: corpoDoPiloto(),
    });

    expect(resposta.statusCode).toBe(201);
    expect(resposta.json()).toMatchObject({ nome: 'Ayrton Senna', equipe: { nome: 'McLaren' } });
  });

  it('responde 400 com os campos inválidos', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/pilotos',
      payload: corpoDoPiloto({ nome: '', numero: 150 }),
    });

    expect(resposta.statusCode).toBe(400);
    expect(resposta.json()).toMatchObject({
      codigo: 'DADOS_INVALIDOS',
      campos: { nome: expect.any(Array), numero: expect.any(Array) },
    });
  });

  it('descreve os erros de validação em português', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/pilotos',
      payload: corpoDoPiloto({ numero: 150 }),
    });

    expect(resposta.json().campos.numero[0]).toMatch(/grande demais/i);
  });

  it('responde 409 quando o número já está em uso', async () => {
    await cadastrar();

    const resposta = await app.inject({
      method: 'POST',
      url: '/pilotos',
      payload: corpoDoPiloto({ nome: 'Lando Norris' }),
    });

    expect(resposta.statusCode).toBe(409);
    expect(resposta.json()).toMatchObject({ codigo: 'NUMERO_JA_EM_USO' });
  });

  it('responde 422 quando a equipe não existe', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/pilotos',
      payload: corpoDoPiloto({ equipeId: randomUUID() }),
    });

    expect(resposta.statusCode).toBe(422);
    expect(resposta.json()).toMatchObject({ codigo: 'EQUIPE_INVALIDA' });
  });
});

describe('GET /pilotos', () => {
  it('lista com paginação e busca', async () => {
    await cadastrar();
    await cadastrar({ nome: 'Alain Prost', numero: 2 });

    const resposta = await app.inject({ method: 'GET', url: '/pilotos?busca=prost&porPagina=5' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({
      total: 1,
      pagina: 1,
      porPagina: 5,
      itens: [{ nome: 'Alain Prost' }],
    });
  });

  it('recusa um tamanho de página acima do limite', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/pilotos?porPagina=500' });

    expect(resposta.statusCode).toBe(400);
  });
});

describe('GET, PUT e DELETE /pilotos/:id', () => {
  it('obtém, atualiza e exclui um piloto', async () => {
    const { id } = await cadastrar();

    const obtido = await app.inject({ method: 'GET', url: `/pilotos/${id}` });
    const atualizado = await app.inject({
      method: 'PUT',
      url: `/pilotos/${id}`,
      payload: corpoDoPiloto({ numero: 1 }),
    });
    const excluido = await app.inject({ method: 'DELETE', url: `/pilotos/${id}` });
    const depois = await app.inject({ method: 'GET', url: `/pilotos/${id}` });

    expect(obtido.statusCode).toBe(200);
    expect(atualizado.json()).toMatchObject({ numero: 1 });
    expect(excluido.statusCode).toBe(204);
    expect(depois.statusCode).toBe(404);
    expect(depois.json()).toMatchObject({ codigo: 'PILOTO_NAO_ENCONTRADO' });
  });

  it('responde 400 para um id que não é uuid', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/pilotos/123' });

    expect(resposta.statusCode).toBe(400);
  });
});

describe('/equipes', () => {
  it('cadastra e lista equipes', async () => {
    const criada = await app.inject({
      method: 'POST',
      url: '/equipes',
      payload: dadosDaEquipe('Ferrari'),
    });
    const lista = await app.inject({ method: 'GET', url: '/equipes' });

    expect(criada.statusCode).toBe(201);
    expect(lista.json()).toEqual([
      expect.objectContaining({ nome: 'Ferrari' }),
      expect.objectContaining({ nome: 'McLaren' }),
    ]);
  });

  it('responde 409 para equipe repetida', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/equipes',
      payload: dadosDaEquipe('mclaren'),
    });

    expect(resposta.statusCode).toBe(409);
  });
});

describe('PUT /equipes/:id', () => {
  it('atualiza as cores e normaliza para minúsculas', async () => {
    const resposta = await app.inject({
      method: 'PUT',
      url: `/equipes/${mclaren.id}`,
      payload: { nome: 'McLaren', cor: '#FF8000', corSecundaria: '#000000' },
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ cor: '#ff8000', corSecundaria: '#000000' });
  });

  it('recusa uma cor fora do formato', async () => {
    const resposta = await app.inject({
      method: 'PUT',
      url: `/equipes/${mclaren.id}`,
      payload: { nome: 'McLaren', cor: 'laranja', corSecundaria: '#000000' },
    });

    expect(resposta.statusCode).toBe(400);
    expect(resposta.json().campos).toHaveProperty('cor');
  });

  it('responde 404 para uma equipe que não existe', async () => {
    const resposta = await app.inject({
      method: 'PUT',
      url: `/equipes/${randomUUID()}`,
      payload: dadosDaEquipe('Lotus'),
    });

    expect(resposta.statusCode).toBe(404);
  });
});

describe('rotas desconhecidas', () => {
  it('responde 404 no formato de erro da API', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/nada' });

    expect(resposta.statusCode).toBe(404);
    expect(resposta.json()).toMatchObject({ codigo: 'ROTA_NAO_ENCONTRADA' });
  });
});
