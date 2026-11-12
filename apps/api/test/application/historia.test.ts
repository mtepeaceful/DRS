import { describe, expect, it } from 'vitest';
import {
  CampeoesDaHistoria,
  temporadasEncerradas,
} from '../../src/application/historia/campeoes-da-historia.js';
import { ConsultarHistoria } from '../../src/application/historia/consultar-historia.js';
import type { Campeao, FonteDaHistoria } from '../../src/application/ports/fonte-da-historia.js';
import { TemporadaNaoEncontrada } from '../../src/domain/erros.js';
import { CampeoesRepositoryEmMemoria } from '../../src/infra/memoria/repositorios-em-memoria.js';

const AGORA = new Date('2026-11-12T12:00:00Z');

function campeao(ano: number, piloto: string, construtor: string | null): Campeao {
  return {
    ano,
    sigla: null,
    piloto,
    pais: 'DE',
    equipe: construtor ?? 'Mercedes',
    pontos: 100,
    vitorias: 5,
    construtor: construtor === null ? null : { nome: construtor, pontos: 150, vitorias: 8 },
  };
}

function fonte(campeoes: Campeao[]) {
  const pedidos: number[][] = [];
  const historia: FonteDaHistoria = {
    buscarCampeoes: async (anos) => {
      pedidos.push(anos);

      return campeoes.filter((c) => anos.includes(c.ano));
    },
    buscarTemporada: async (ano) => ({ ano, corridas: [], pilotos: [], construtores: [] }),
    listarPilotos: async () => [],
    buscarCarreira: () => Promise.reject(new Error('não usado')),
  };

  return { historia, pedidos };
}

describe('temporadasEncerradas', () => {
  it('vai de 1950 até o ano passado', () => {
    const anos = temporadasEncerradas(AGORA);

    expect(anos[0]).toBe(1950);
    expect(anos.at(-1)).toBe(2025);
    expect(anos).toHaveLength(76);
  });
});

describe('CampeoesDaHistoria', () => {
  it('busca em lotes só os anos que faltam e guarda o que encontrou', async () => {
    const repositorio = new CampeoesRepositoryEmMemoria();
    await repositorio.guardar([campeao(2000, 'Michael Schumacher', 'Ferrari')]);
    const { historia, pedidos } = fonte(
      Array.from({ length: 25 }, (_, i) => campeao(1990 + i, `Piloto ${i}`, 'Equipe')),
    );

    const { campeoes, novos } = await new CampeoesDaHistoria(repositorio, historia).garantir(
      Array.from({ length: 25 }, (_, i) => 1990 + i),
    );

    expect(novos).toBe(24);
    expect(pedidos.map((lote) => lote.length)).toEqual([10, 10, 4]);
    expect(pedidos.flat()).not.toContain(2000);
    expect(campeoes).toHaveLength(25);
    expect((await repositorio.listar()).length).toBe(25);
  });

  it('não repete consultas quando dois pedidos chegam juntos', async () => {
    const { historia, pedidos } = fonte([campeao(1988, 'Ayrton Senna', 'McLaren')]);
    const campeoes = new CampeoesDaHistoria(new CampeoesRepositoryEmMemoria(), historia);

    await Promise.all([campeoes.garantir([1988]), campeoes.garantir([1988])]);

    expect(pedidos).toEqual([[1988]]);
  });

  it('segue funcionando depois de uma falha', async () => {
    const { historia } = fonte([campeao(1988, 'Ayrton Senna', 'McLaren')]);
    const original = historia.buscarCampeoes;
    historia.buscarCampeoes = () => Promise.reject(new Error('fora do ar'));
    const campeoes = new CampeoesDaHistoria(new CampeoesRepositoryEmMemoria(), historia);

    await expect(campeoes.garantir([1988])).rejects.toThrow('fora do ar');

    historia.buscarCampeoes = original;
    await expect(campeoes.garantir([1988])).resolves.toMatchObject({ novos: 1 });
  });
});

describe('ConsultarHistoria', () => {
  async function consultar(campeoes: Campeao[]) {
    const repositorio = new CampeoesRepositoryEmMemoria();
    await repositorio.guardar(campeoes);

    return new ConsultarHistoria(repositorio, fonte([]).historia);
  }

  it('lista do mais recente ao mais antigo e diz quantas temporadas faltam', async () => {
    const historia = await consultar([
      campeao(1950, 'Nino Farina', null),
      campeao(2025, 'Lando Norris', 'McLaren'),
    ]);

    const resultado = await historia.listarCampeoes(AGORA);

    expect(resultado.temporadas.map((t) => t.ano)).toEqual([2025, 1950]);
    expect(resultado.faltando).toBe(74);
  });

  it('monta o ranking de maiores campeões de pilotos e de construtores', async () => {
    const historia = await consultar([
      campeao(1994, 'Michael Schumacher', 'Williams'),
      campeao(1995, 'Michael Schumacher', 'Benetton'),
      campeao(2000, 'Michael Schumacher', 'Ferrari'),
      campeao(2001, 'Michael Schumacher', 'Ferrari'),
      campeao(1996, 'Damon Hill', 'Williams'),
      campeao(1957, 'Juan Manuel Fangio', null),
    ]);

    const { maioresPilotos, maioresConstrutores } = await historia.listarCampeoes(AGORA);

    expect(maioresPilotos[0]).toEqual({
      nome: 'Michael Schumacher',
      pais: 'DE',
      titulos: 4,
      anos: [1994, 1995, 2000, 2001],
    });
    expect(maioresConstrutores.map((c) => [c.nome, c.titulos])).toEqual([
      ['Williams', 2],
      ['Ferrari', 2],
      ['Benetton', 1],
    ]);
  });

  it('só abre temporadas já encerradas', async () => {
    const historia = await consultar([]);

    await expect(historia.temporada(1988, AGORA)).resolves.toMatchObject({ ano: 1988 });
    expect(() => historia.temporada(2026, AGORA)).toThrow(TemporadaNaoEncontrada);
    expect(() => historia.temporada(1949, AGORA)).toThrow(TemporadaNaoEncontrada);
  });
});
