import { beforeEach, describe, expect, it } from 'vitest';
import { ImportarTemporada } from '../../src/application/importacao/importar-temporada.js';
import { CampeoesDaHistoria } from '../../src/application/historia/campeoes-da-historia.js';
import { ManterGridAtualizado } from '../../src/application/importacao/manter-grid-atualizado.js';
import type {
  FonteDeDadosDaF1,
  Temporada,
} from '../../src/application/ports/fonte-de-dados-da-f1.js';
import type { Campeao, FonteDaHistoria } from '../../src/application/ports/fonte-da-historia.js';
import {
  CampeoesRepositoryEmMemoria,
  EquipeRepositoryEmMemoria,
  ImportacaoRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';

const temporada: Temporada = {
  ano: 2026,
  equipes: [
    { nome: 'Ferrari', cor: '#ed1131', corSecundaria: '#ffffff' },
    { nome: 'McLaren', cor: '#f47600', corSecundaria: '#ffffff' },
  ],
  pilotos: [
    { nome: 'Lewis Hamilton', sigla: 'HAM', numero: 44, pais: 'GB', equipe: 'Ferrari' },
    { nome: 'Lando Norris', sigla: 'NOR', numero: 1, pais: 'GB', equipe: 'McLaren' },
  ],
};

function campeao(ano: number, sigla: string | null, piloto: string): Campeao {
  return { ano, sigla, piloto, pais: 'GB', equipe: 'X', pontos: 1, vitorias: 1, construtor: null };
}

const campeoesReais: Campeao[] = [
  campeao(1996, null, 'Damon Hill'),
  ...[2008, 2014, 2015, 2017, 2018, 2019, 2020].map((ano) => campeao(ano, 'HAM', 'Lewis Hamilton')),
  campeao(2025, 'NOR', 'Lando Norris'),
];

function fonte(dados: Temporada): FonteDeDadosDaF1 {
  return { buscarTemporadaAtual: async () => dados };
}

let equipes: EquipeRepositoryEmMemoria;
let pilotos: PilotoRepositoryEmMemoria;
let importacoes: ImportacaoRepositoryEmMemoria;
let historia: FonteDaHistoria & { anosConsultados: number[] };
let campeoes: CampeoesDaHistoria;

function criar(origem: FonteDeDadosDaF1, agora = () => new Date('2026-11-11T12:00:00Z')) {
  return new ImportarTemporada(pilotos, equipes, importacoes, campeoes, origem, agora);
}

beforeEach(() => {
  equipes = new EquipeRepositoryEmMemoria();
  pilotos = new PilotoRepositoryEmMemoria(equipes);
  importacoes = new ImportacaoRepositoryEmMemoria();
  const anosConsultados: number[] = [];
  historia = {
    anosConsultados,
    buscarCampeoes: async (anos) => {
      anosConsultados.push(...anos);

      return campeoesReais.filter((c) => anos.includes(c.ano));
    },
    buscarTemporada: () => Promise.reject(new Error('não usado')),
    buscarCarreira: async () => null,
  };
  campeoes = new CampeoesDaHistoria(new CampeoesRepositoryEmMemoria(), historia);
});

describe('ImportarTemporada', () => {
  it('cria equipes e pilotos num banco vazio', async () => {
    const resultado = await criar(fonte(temporada)).executar();

    expect(resultado).toEqual({
      ano: 2026,
      equipes: { criadas: 2, atualizadas: 0 },
      pilotos: { criados: 2, atualizados: 0, ignorados: [] },
    });
    expect(await pilotos.buscarPorNumero(44)).toMatchObject({
      nome: 'Lewis Hamilton',
      titulos: 7,
      equipe: { nome: 'Ferrari', cor: '#ed1131' },
    });
  });

  it('pode rodar de novo sem duplicar nada', async () => {
    const importar = criar(fonte(temporada));
    await importar.executar();

    const segunda = await importar.executar();
    const { total } = await pilotos.listar({ pagina: 1, porPagina: 50 });

    expect(segunda.equipes).toEqual({ criadas: 0, atualizadas: 2 });
    expect(segunda.pilotos).toMatchObject({ criados: 0, atualizados: 2 });
    expect(total).toBe(2);
  });

  it('atualiza a equipe existente mantendo o nome que já estava cadastrado', async () => {
    await equipes.criar({ nome: 'FERRARI', cor: '#000000', corSecundaria: '#000000' });

    await criar(fonte(temporada)).executar();

    expect(await equipes.buscarPorNome('ferrari')).toMatchObject({
      nome: 'FERRARI',
      cor: '#ed1131',
    });
  });

  it('pula o piloto cujo número já pertence a outro', async () => {
    const mclaren = await equipes.criar({
      nome: 'McLaren',
      cor: '#000000',
      corSecundaria: '#000000',
    });
    await pilotos.criar({
      nome: 'Ayrton Senna',
      numero: 1,
      pais: 'BR',
      titulos: 3,
      equipeId: mclaren.id,
    });

    const resultado = await criar(fonte(temporada)).executar();

    expect(resultado.pilotos.ignorados).toEqual([
      { nome: 'Lando Norris', motivo: 'o número 1 já pertence a Ayrton Senna' },
    ]);
    expect(await pilotos.buscarPorNumero(1)).toMatchObject({ nome: 'Ayrton Senna' });
  });

  it('pula o piloto sem país conhecido', async () => {
    const resultado = await criar(
      fonte({
        ...temporada,
        pilotos: [
          { nome: 'Piloto Misterioso', sigla: 'MIS', numero: 9, pais: null, equipe: 'Ferrari' },
        ],
      }),
    ).executar();

    expect(resultado.pilotos.ignorados).toEqual([
      { nome: 'Piloto Misterioso', motivo: 'país de origem desconhecido' },
    ]);
  });

  it('conta os títulos das últimas 30 temporadas', async () => {
    await criar(fonte(temporada)).executar();

    expect(await pilotos.buscarPorNumero(44)).toMatchObject({ titulos: 7 });
    expect(await pilotos.buscarPorNumero(1)).toMatchObject({ titulos: 1 });
  });

  it('guarda os campeões e não consulta de novo os anos já conhecidos', async () => {
    await criar(fonte(temporada)).executar();
    const primeiraVez = [...historia.anosConsultados];

    await criar(fonte(temporada)).executar();

    expect(primeiraVez).toHaveLength(30);
    expect(primeiraVez[0]).toBe(1996);
    expect(historia.anosConsultados).toEqual(
      primeiraVez.concat(primeiraVez.filter((ano) => !campeoesReais.some((c) => c.ano === ano))),
    );
    expect(await pilotos.buscarPorNumero(44)).toMatchObject({ titulos: 7 });
  });

  it('registra quando a importação terminou', async () => {
    await criar(fonte(temporada)).executar();

    expect(await importacoes.ultimaImportacao()).toEqual(new Date('2026-11-11T12:00:00Z'));
  });

  it('não registra a importação quando a fonte falha', async () => {
    const origem = fonte(temporada);
    origem.buscarTemporadaAtual = () => Promise.reject(new Error('fora do ar'));

    await expect(criar(origem).executar()).rejects.toThrow('fora do ar');
    expect(await importacoes.ultimaImportacao()).toBeNull();
  });

  it('reaproveita a importação em andamento em vez de rodar duas ao mesmo tempo', async () => {
    const origem = fonte(temporada);
    let chamadas = 0;
    origem.buscarTemporadaAtual = async () => {
      chamadas++;

      return temporada;
    };
    const importar = criar(origem);

    const [a, b] = await Promise.all([importar.executar(), importar.executar()]);

    expect(a).toBe(b);
    expect(chamadas).toBe(1);
  });
});

describe('ManterGridAtualizado', () => {
  const DIA = 24 * 60 * 60_000;

  it('importa quando nunca houve importação', async () => {
    const manter = new ManterGridAtualizado(criar(fonte(temporada)), importacoes);

    const resultado = await manter.executarSeNecessario(new Date('2026-11-11T12:00:00Z'));

    expect(resultado?.pilotos.criados).toBe(2);
  });

  it('não faz nada se a última importação tem menos de um dia', async () => {
    await importacoes.registrarImportacao(new Date('2026-11-11T00:00:00Z'));
    const manter = new ManterGridAtualizado(criar(fonte(temporada)), importacoes, DIA);

    expect(await manter.executarSeNecessario(new Date('2026-11-11T23:59:00Z'))).toBeNull();
    expect((await pilotos.listar({ pagina: 1, porPagina: 50 })).total).toBe(0);
  });

  it('importa de novo depois de um dia', async () => {
    await importacoes.registrarImportacao(new Date('2026-11-10T00:00:00Z'));
    const manter = new ManterGridAtualizado(criar(fonte(temporada)), importacoes, DIA);

    const resultado = await manter.executarSeNecessario(new Date('2026-11-11T00:00:01Z'));

    expect(resultado).not.toBeNull();
  });
});
