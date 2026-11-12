import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteHistoriaJolpica } from '../../src/infra/f1/fonte-historia-jolpica.js';

vi.mock('node:timers/promises', () => ({ setTimeout: async () => undefined }));

const piloto = (givenName: string, familyName: string, extra: Record<string, string> = {}) => ({
  givenName,
  familyName,
  nationality: 'Brazilian',
  ...extra,
});

function classificacao(chave: string, linhas: unknown[]) {
  return {
    MRData: { StandingsTable: { StandingsLists: linhas.length ? [{ [chave]: linhas }] : [] } },
  };
}

const respostas: Record<string, unknown> = {
  '/1988/driverstandings/1.json': classificacao('DriverStandings', [
    {
      position: '1',
      points: '90',
      wins: '8',
      Driver: piloto('Ayrton', 'Senna', { code: 'SEN' }),
      Constructors: [{ name: 'McLaren' }],
    },
  ]),
  '/1988/constructorstandings/1.json': classificacao('ConstructorStandings', [
    { position: '1', points: '199', wins: '15', Constructor: { name: 'McLaren' } },
  ]),
  '/1952/driverstandings/1.json': classificacao('DriverStandings', [
    {
      position: '1',
      points: '36',
      wins: '6',
      Driver: piloto('Alberto', 'Ascari', { nationality: 'Italian' }),
      Constructors: [{ name: 'Ferrari' }],
    },
  ]),
  '/1952/constructorstandings/1.json': classificacao('ConstructorStandings', []),
  '/1988.json': {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: '1',
            raceName: 'Brazilian Grand Prix',
            date: '1988-04-03',
            Circuit: {
              circuitId: 'jacarepagua',
              circuitName: 'Jacarepaguá',
              Location: { country: 'Brazil' },
            },
          },
          {
            round: '2',
            raceName: 'San Marino Grand Prix',
            date: '1988-05-01',
            Circuit: {
              circuitId: 'imola',
              circuitName: 'Imola',
              Location: { country: 'Italy' },
            },
          },
        ],
      },
    },
  },
  '/1988/results/1.json': {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: '1',
            Results: [
              {
                Driver: piloto('Alain', 'Prost', { nationality: 'French' }),
                Constructor: { name: 'McLaren' },
              },
            ],
          },
        ],
      },
    },
  },
  '/1988/driverstandings.json': classificacao('DriverStandings', [
    {
      position: '1',
      points: '90',
      wins: '8',
      Driver: piloto('Ayrton', 'Senna'),
      Constructors: [{ name: 'McLaren' }],
    },
    {
      points: '0',
      wins: '0',
      Driver: piloto('Piloto', 'Desconhecido', { nationality: 'Martian' }),
      Constructors: [{ name: 'Lotus' }, { name: 'Tyrrell' }],
    },
  ]),
  '/1988/constructorstandings.json': classificacao('ConstructorStandings', [
    { position: '1', points: '199', wins: '15', Constructor: { name: 'McLaren' } },
  ]),
};

function simularJolpica() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
    const caminho = new URL(String(entrada)).pathname.replace('/ergast/f1', '');

    return caminho in respostas
      ? Response.json(respostas[caminho])
      : new Response(null, { status: 404 });
  });
}

afterEach(() => vi.restoreAllMocks());

describe('FonteHistoriaJolpica', () => {
  it('traz o campeão de pilotos e de construtores de cada ano', async () => {
    simularJolpica();

    const campeoes = await new FonteHistoriaJolpica().buscarCampeoes([1988, 1952]);

    expect(campeoes).toEqual([
      {
        ano: 1988,
        sigla: 'SEN',
        piloto: 'Ayrton Senna',
        pais: 'BR',
        equipe: 'McLaren',
        pontos: 90,
        vitorias: 8,
        construtor: { nome: 'McLaren', pontos: 199, vitorias: 15 },
      },
      {
        ano: 1952,
        sigla: null,
        piloto: 'Alberto Ascari',
        pais: 'IT',
        equipe: 'Ferrari',
        pontos: 36,
        vitorias: 6,
        construtor: null,
      },
    ]);
  });

  it('monta a temporada com corridas, vencedores e classificações', async () => {
    simularJolpica();

    const temporada = await new FonteHistoriaJolpica().buscarTemporada(1988);

    expect(temporada.corridas).toEqual([
      {
        rodada: 1,
        nome: 'Brazilian Grand Prix',
        circuito: 'Jacarepaguá',
        circuitoId: 'jacarepagua',
        pais: 'Brazil',
        data: '1988-04-03',
        vencedor: { nome: 'Alain Prost', equipe: 'McLaren' },
      },
      expect.objectContaining({ rodada: 2, vencedor: null }),
    ]);
    expect(temporada.pilotos[1]).toEqual({
      posicao: 2,
      nome: 'Piloto Desconhecido',
      pais: null,
      equipes: ['Lotus', 'Tyrrell'],
      pontos: 0,
      vitorias: 0,
    });
    expect(temporada.construtores).toEqual([
      { posicao: 1, nome: 'McLaren', pontos: 199, vitorias: 15 },
    ]);
  });
});

describe('FonteHistoriaJolpica · pilotos', () => {
  function simularPilotos() {
    const pedidos: string[] = [];
    const totais: Record<string, number> = {
      '/drivers/perez/results.json': 290,
      '/drivers/perez/results/1.json': 6,
      '/drivers/perez/results/2.json': 15,
      '/drivers/perez/results/3.json': 18,
      '/drivers/perez/grid/1/results.json': 3,
    };
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
      const url = new URL(String(entrada));
      const caminho = url.pathname.replace('/ergast/f1', '');
      pedidos.push(caminho);

      if (caminho === '/drivers.json') {
        const offset = Number(url.searchParams.get('offset'));
        const pilotos =
          offset === 0
            ? [{ driverId: 'senna', givenName: 'Ayrton', familyName: 'Senna' }]
            : [
                {
                  driverId: 'perez',
                  givenName: 'Sergio',
                  familyName: 'Pérez',
                  dateOfBirth: '1990-01-26',
                  nationality: 'Mexican',
                  url: 'https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez',
                },
              ];

        return Response.json({ MRData: { total: '101', DriverTable: { Drivers: pilotos } } });
      }

      if (caminho === '/drivers/perez/seasons.json') {
        return Response.json({
          MRData: {
            SeasonTable: { Seasons: [2011, 2012, 2026].map((ano) => ({ season: String(ano) })) },
          },
        });
      }

      if (caminho === '/drivers/perez/constructors.json') {
        return Response.json({
          MRData: {
            ConstructorTable: {
              Constructors: [
                { constructorId: 'sauber', name: 'Sauber' },
                { constructorId: 'red_bull', name: 'Red Bull' },
              ],
            },
          },
        });
      }

      return caminho in totais
        ? Response.json({ MRData: { total: String(totais[caminho]) } })
        : new Response(null, { status: 404 });
    });

    return pedidos;
  }

  it('lista todos os pilotos de todas as páginas, com país e artigo da Wikipédia', async () => {
    const pedidos = simularPilotos();

    const pilotos = await new FonteHistoriaJolpica().listarPilotos();

    expect(pilotos).toEqual([
      { id: 'senna', nome: 'Ayrton Senna', pais: null, nascimento: null, wikipedia: null },
      {
        id: 'perez',
        nome: 'Sergio Pérez',
        pais: 'MX',
        nascimento: '1990-01-26',
        wikipedia: 'Sergio Pérez',
      },
    ]);
    expect(pedidos).toEqual(['/drivers.json', '/drivers.json']);
  });

  it('monta a carreira com pódios somados e as equipes do piloto', async () => {
    simularPilotos();

    expect(await new FonteHistoriaJolpica().buscarCarreira('perez')).toEqual({
      temporadas: [2011, 2012, 2026],
      corridas: 290,
      vitorias: 6,
      podios: 39,
      poles: 3,
      equipes: [
        { id: 'sauber', nome: 'Sauber' },
        { id: 'red_bull', nome: 'Red Bull' },
      ],
    });
  });
});
