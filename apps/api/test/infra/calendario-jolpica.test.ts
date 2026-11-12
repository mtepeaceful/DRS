import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteCampeonatoJolpica } from '../../src/infra/f1/fonte-campeonato-jolpica.js';

const etapa = (rodada: number, nome: string, data: string) => ({
  round: String(rodada),
  raceName: nome,
  date: data,
  time: '17:00:00Z',
  Circuit: {
    circuitName: `Circuito ${rodada}`,
    Location: { locality: 'Cidade', country: 'Brasil' },
  },
});

const linha = (posicao: number, extra: Record<string, unknown> = {}) => ({
  number: String(posicao * 10),
  position: String(posicao),
  positionText: String(posicao),
  points: String(26 - posicao),
  grid: String(posicao + 1),
  laps: '71',
  status: 'Finished',
  Driver: { givenName: 'Piloto', familyName: String(posicao) },
  Constructor: { name: 'Equipe' },
  ...extra,
});

const respostas: Record<string, unknown> = {
  '/current.json': {
    MRData: {
      RaceTable: {
        season: '2026',
        Races: [
          etapa(1, 'GP da Austrália', '2026-03-08'),
          etapa(2, 'GP de São Paulo', '2026-11-08'),
          etapa(3, 'GP de Las Vegas', '2026-11-21'),
        ],
      },
    },
  },
  '/current/results/1.json': {
    MRData: {
      RaceTable: {
        Races: [
          { round: '1', Results: [linha(1)] },
          {
            round: '2',
            Results: [linha(1, { Driver: { givenName: 'Gabriel', familyName: 'Bortoleto' } })],
          },
        ],
      },
    },
  },
  '/current/2/results.json': {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: '2',
            Results: [
              linha(1, { Time: { time: '1:32:10.512' }, FastestLap: { rank: '1' } }),
              linha(2, { Time: { time: '+3.201' } }),
              linha(3, { laps: '70', status: 'Lapped', Time: { time: '+12.004' } }),
              linha(4, { positionText: 'R', laps: '12', status: 'Retired', points: '0' }),
            ],
          },
        ],
      },
    },
  },
  '/current/3/results.json': { MRData: { RaceTable: { Races: [] } } },
  '/current/2/sprint.json': {
    MRData: { RaceTable: { Races: [{ SprintResults: [linha(1, { laps: '24' })] }] } },
  },
  '/current/3/sprint.json': { MRData: { RaceTable: { Races: [] } } },
  '/current/2/qualifying.json': {
    MRData: {
      RaceTable: {
        Races: [
          {
            QualifyingResults: [
              {
                number: '10',
                position: '1',
                Driver: { givenName: 'Piloto', familyName: '1' },
                Constructor: { name: 'Equipe' },
                Q1: '1:30.939',
                Q2: '1:29.207',
                Q3: '1:27.470',
              },
              {
                number: '20',
                position: '20',
                Driver: { givenName: 'Piloto', familyName: '20' },
                Constructor: { name: 'Equipe' },
                Q1: '1:41.564',
              },
            ],
          },
        ],
      },
    },
  },
  '/current/3/qualifying.json': { MRData: { RaceTable: { Races: [] } } },
};

afterEach(() => vi.restoreAllMocks());

function simularJolpica() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
    const caminho = new URL(String(entrada)).pathname;
    const chave = Object.keys(respostas).find((final) => caminho.endsWith(final));

    return chave ? Response.json(respostas[chave]) : new Response(null, { status: 404 });
  });
}

describe('FonteCampeonatoJolpica · calendário', () => {
  it('lista todas as etapas com o vencedor das que já aconteceram', async () => {
    simularJolpica();

    const etapas = await new FonteCampeonatoJolpica().buscarCalendario();

    expect(etapas.map((e) => [e.rodada, e.vencedor?.nome ?? null])).toEqual([
      [1, 'Piloto 1'],
      [2, 'Gabriel Bortoleto'],
      [3, null],
    ]);
  });

  it('traduz a classificação completa de uma etapa', async () => {
    simularJolpica();

    const resultado = await new FonteCampeonatoJolpica().buscarResultado(2);

    expect(resultado?.etapa.nome).toBe('GP de São Paulo');
    expect(resultado?.classificacao).toEqual([
      expect.objectContaining({
        posicao: 1,
        tempo: '1:32:10.512',
        situacao: 'Completou',
        voltaMaisRapida: true,
      }),
      expect.objectContaining({ posicao: 2, tempo: '+3.201', voltaMaisRapida: false }),
      expect.objectContaining({
        posicao: 3,
        classificado: true,
        tempo: null,
        situacao: '+1 volta',
      }),
      expect.objectContaining({
        posicao: 4,
        classificado: false,
        situacao: 'Abandonou',
        pontos: 0,
      }),
    ]);
  });

  it('traz a classificação de sábado e a sprint da etapa', async () => {
    simularJolpica();

    const resultado = await new FonteCampeonatoJolpica().buscarResultado(2);

    expect(resultado?.sprint).toEqual([
      expect.objectContaining({ posicao: 1, voltas: 24, situacao: 'Completou' }),
    ]);
    expect(resultado?.qualificacao).toEqual([
      {
        posicao: 1,
        nome: 'Piloto 1',
        numero: 10,
        equipe: 'Equipe',
        q1: '1:30.939',
        q2: '1:29.207',
        q3: '1:27.470',
      },
      {
        posicao: 20,
        nome: 'Piloto 20',
        numero: 20,
        equipe: 'Equipe',
        q1: '1:41.564',
        q2: null,
        q3: null,
      },
    ]);
  });

  it('devolve classificação vazia para etapa ainda não disputada', async () => {
    simularJolpica();

    const resultado = await new FonteCampeonatoJolpica().buscarResultado(3);

    expect(resultado).toMatchObject({
      etapa: { rodada: 3 },
      classificacao: [],
      sprint: [],
      qualificacao: [],
    });
  });
});

describe('FonteCampeonatoJolpica · etapa inexistente', () => {
  it('devolve nulo sem consultar resultados', async () => {
    simularJolpica();

    const resultado = await new FonteCampeonatoJolpica().buscarResultado(30);

    expect(resultado).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('FonteCampeonatoJolpica · participações', () => {
  it('percorre todas as páginas de corridas e sprints', async () => {
    const pedidos: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
      const url = new URL(String(entrada));
      pedidos.push(`${url.pathname.split('/').pop()}?${url.searchParams.get('offset')}`);
      const sprint = url.pathname.endsWith('/sprint.json');
      const offset = Number(url.searchParams.get('offset'));
      const corridas = sprint
        ? [{ round: '2', SprintResults: [linha(1)] }]
        : [
            {
              round: String(offset / 100 + 1),
              Results: [linha(1), linha(4, { positionText: 'R' })],
            },
          ];

      return Response.json({
        MRData: { total: sprint ? '1' : '150', RaceTable: { Races: corridas } },
      });
    });

    const participacoes = await new FonteCampeonatoJolpica().buscarParticipacoes();

    expect(pedidos).toEqual(['results.json?0', 'results.json?100', 'sprint.json?0']);
    expect(participacoes).toHaveLength(5);
    expect(participacoes).toContainEqual({
      rodada: 2,
      tipo: 'corrida',
      nome: 'Piloto 4',
      equipe: 'Equipe',
      posicao: 4,
      classificado: false,
      largada: 5,
      pontos: 22,
    });
    expect(participacoes.filter((p) => p.tipo === 'sprint')).toHaveLength(1);
  });
});
