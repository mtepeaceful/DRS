import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import { configuracaoDeTeste } from '../support/autenticacao.js';
import {
  EquipeRepositoryEmMemoria,
  ImportacaoRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';

const equipes = new EquipeRepositoryEmMemoria();
const app = await buildApp(
  {
    equipes,
    pilotos: new PilotoRepositoryEmMemoria(equipes),
    importacoes: new ImportacaoRepositoryEmMemoria(),
  },
  { ...configuracaoDeTeste, origensPermitidas: ['https://drs.onrender.com'] },
);

afterAll(() => app.close());

describe('CORS', () => {
  it('libera o domínio configurado', async () => {
    const resposta = await app.inject({
      method: 'GET',
      url: '/equipes',
      headers: { origin: 'https://drs.onrender.com' },
    });

    expect(resposta.headers['access-control-allow-origin']).toBe('https://drs.onrender.com');
  });

  it('não libera outros domínios', async () => {
    const resposta = await app.inject({
      method: 'GET',
      url: '/equipes',
      headers: { origin: 'https://site-qualquer.com' },
    });

    expect(resposta.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('responde ao preflight do domínio configurado', async () => {
    const resposta = await app.inject({
      method: 'OPTIONS',
      url: '/pilotos',
      headers: {
        origin: 'https://drs.onrender.com',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });

    expect(resposta.statusCode).toBe(204);
    expect(resposta.headers['access-control-allow-methods']).toContain('POST');
    expect(resposta.headers['access-control-allow-headers']).toContain('authorization');
  });
});
