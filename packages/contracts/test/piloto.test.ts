import { describe, expect, it } from 'vitest';
import { dadosPilotoSchema, listarPilotosQuerySchema } from '../src/index.js';

const dadosValidos = {
  nome: 'Ayrton Senna',
  numero: 12,
  nacionalidade: 'Brasileiro',
  equipeId: '0b9f6f0e-6d0b-4c57-9d59-5f0a6b0f6a11',
};

describe('dadosPilotoSchema', () => {
  it('assume zero títulos quando o campo não é enviado', () => {
    expect(dadosPilotoSchema.parse(dadosValidos).titulos).toBe(0);
  });

  it('remove espaços nas pontas do nome', () => {
    const dados = dadosPilotoSchema.parse({ ...dadosValidos, nome: '  Ayrton Senna ' });

    expect(dados.nome).toBe('Ayrton Senna');
  });

  it.each([-1, 100, 4.5])('recusa o número %s', (numero) => {
    expect(dadosPilotoSchema.safeParse({ ...dadosValidos, numero }).success).toBe(false);
  });

  it('recusa títulos negativos', () => {
    expect(dadosPilotoSchema.safeParse({ ...dadosValidos, titulos: -1 }).success).toBe(false);
  });

  it('recusa equipeId que não é uuid', () => {
    expect(dadosPilotoSchema.safeParse({ ...dadosValidos, equipeId: '1' }).success).toBe(false);
  });
});

describe('listarPilotosQuerySchema', () => {
  it('aplica a paginação padrão', () => {
    expect(listarPilotosQuerySchema.parse({})).toEqual({ pagina: 1, porPagina: 10 });
  });

  it('converte os números recebidos como texto na URL', () => {
    const query = listarPilotosQuerySchema.parse({ pagina: '3', porPagina: '20' });

    expect(query).toEqual({ pagina: 3, porPagina: 20 });
  });

  it('limita o tamanho da página', () => {
    expect(listarPilotosQuerySchema.safeParse({ porPagina: '500' }).success).toBe(false);
  });
});
