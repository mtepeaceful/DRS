import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { emitirToken } from '../../src/infra/seguranca/sessao.js';
import { cabecalhoDeSessao, configuracaoDeTeste, SENHA_DE_TESTE } from '../support/autenticacao.js';
import { dadosDaEquipe } from '../support/dados.js';

let app: FastifyInstance;

beforeEach(async () => {
  const equipes = new EquipeRepositoryEmMemoria();
  app = await buildApp(
    { equipes, pilotos: new PilotoRepositoryEmMemoria(equipes) },
    configuracaoDeTeste,
  );
});

afterEach(() => app.close());

function criarEquipe(headers: Record<string, string> = {}) {
  return app.inject({
    method: 'POST',
    url: '/equipes',
    payload: dadosDaEquipe('Ferrari'),
    headers,
  });
}

function bearer(token: string) {
  return { authorization: `Bearer ${token}` };
}

describe('escritas protegidas', () => {
  it('recusa escrita sem sessão', async () => {
    const resposta = await criarEquipe();

    expect(resposta.statusCode).toBe(401);
    expect(resposta.json()).toMatchObject({ codigo: 'NAO_AUTENTICADO' });
  });

  it.each([
    ['PUT', `/equipes/${randomUUID()}`],
    ['DELETE', `/pilotos/${randomUUID()}`],
    ['POST', '/pilotos'],
  ] as const)('recusa %s %s sem sessão antes de validar o corpo', async (method, url) => {
    const resposta = await app.inject({ method, url, payload: {} });

    expect(resposta.statusCode).toBe(401);
  });

  it('aceita escrita com sessão válida', async () => {
    expect((await criarEquipe(cabecalhoDeSessao)).statusCode).toBe(201);
  });

  it('recusa token com conteúdo adulterado', async () => {
    const assinatura = cabecalhoDeSessao.authorization.split('.')[1] ?? '';
    const conteudo = Buffer.from(JSON.stringify({ exp: Date.now() * 2 })).toString('base64url');

    expect((await criarEquipe(bearer(`${conteudo}.${assinatura}`))).statusCode).toBe(401);
  });

  it('recusa token assinado com outro segredo', async () => {
    const { token } = emitirToken('outro-segredo-com-mais-de-32-caracteres!!');

    expect((await criarEquipe(bearer(token))).statusCode).toBe(401);
  });

  it('recusa token expirado', async () => {
    const noveHorasAtras = Date.now() - 9 * 60 * 60 * 1000;
    const { token } = emitirToken(configuracaoDeTeste.autenticacao.segredo, noveHorasAtras);

    expect((await criarEquipe(bearer(token))).statusCode).toBe(401);
  });

  it('mantém a leitura pública', async () => {
    expect((await app.inject({ method: 'GET', url: '/pilotos' })).statusCode).toBe(200);
  });
});

describe('POST /sessao', () => {
  it('emite um token que libera as escritas', async () => {
    const sessao = await app.inject({
      method: 'POST',
      url: '/sessao',
      payload: { senha: SENHA_DE_TESTE },
    });
    const { token } = sessao.json<{ token: string }>();

    expect(sessao.statusCode).toBe(201);
    expect((await criarEquipe(bearer(token))).statusCode).toBe(201);
  });

  it('recusa senha incorreta sem emitir token', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/sessao',
      payload: { senha: 'senha-errada-qualquer' },
    });

    expect(resposta.statusCode).toBe(401);
    expect(resposta.json()).not.toHaveProperty('token');
  });

  it('limita as tentativas de login', async () => {
    const tentativa = () =>
      app.inject({ method: 'POST', url: '/sessao', payload: { senha: 'errada' } });

    for (let i = 0; i < 5; i++) {
      await tentativa();
    }

    const bloqueada = await tentativa();

    expect(bloqueada.statusCode).toBe(429);
    expect(bloqueada.json()).toMatchObject({ codigo: 'MUITAS_REQUISICOES' });
  });
});

describe('limites', () => {
  it('recusa corpo maior que 16 KB', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/equipes',
      headers: cabecalhoDeSessao,
      payload: { nome: 'x'.repeat(20 * 1024), cor: '#000000', corSecundaria: '#000000' },
    });

    expect(resposta.statusCode).toBe(413);
  });
});
