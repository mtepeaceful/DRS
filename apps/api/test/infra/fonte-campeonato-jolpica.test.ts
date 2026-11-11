import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteCampeonatoJolpica } from '../../src/infra/f1/fonte-campeonato-jolpica.js';

const circuito = (cidade: string) => ({
  circuitName: `Circuito de ${cidade}`,
  Location: { locality: cidade, country: 'Brasil' },
});

const respostas: Record<string, unknown> = {
  'current.json': {
    MRData: {
      RaceTable: {
        season: '2026',
        Races: [
          {
            round: '1',
            raceName: 'GP passado',
            date: '2026-03-01',
            time: '05:00:00Z',
            Circuit: circuito('Melbourne'),
          },
          {
            round: '2',
            raceName: 'GP de São Paulo',
            date: '2026-11-08',
            time: '17:00:00Z',
            Circuit: circuito('São Paulo'),
            Qualifying: { date: '2026-11-07', time: '18:00:00Z' },
            Sprint: { date: '2026-11-07', time: '14:00:00Z' },
          },
        ],
      },
    },
  },
  'driverStandings.json': {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            round: '1',
            DriverStandings: [
              {
                position: '1',
                points: '25',
                wins: '1',
                Driver: { givenName: 'Lando', familyName: 'Norris' },
                Constructors: [{ name: 'McLaren' }],
              },
              {
                points: '0',
                wins: '0',
                Driver: { givenName: 'Sem', familyName: 'Posição' },
                Constructors: [],
              },
            ],
          },
        ],
      },
    },
  },
  'constructorStandings.json': {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            ConstructorStandings: [
              { position: '1', points: '43', wins: '1', Constructor: { name: 'McLaren' } },
            ],
          },
        ],
      },
    },
  },
  'results.json': {
    MRData: {
      RaceTable: {
        Races: [
          {
            raceName: 'GP passado',
            date: '2026-03-01',
            Results: [1, 2, 3].map((posicao) => ({
              position: String(posicao),
              Driver: { givenName: 'Piloto', familyName: String(posicao) },
              Constructor: { name: 'Equipe' },
            })),
          },
        ],
      },
    },
  },
};

afterEach(() => vi.restoreAllMocks());

describe('FonteCampeonatoJolpica', () => {
  it('monta próxima corrida, classificações e último pódio', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
      const chave = Object.keys(respostas).find((nome) =>
        String(entrada).split('?')[0]?.endsWith(nome),
      );

      return Response.json(chave ? respostas[chave] : {});
    });

    const campeonato = await new FonteCampeonatoJolpica().buscarCampeonato(
      new Date('2026-06-01T00:00:00Z'),
    );

    expect(campeonato).toMatchObject({ ano: 2026, totalDeRodadas: 2, rodadasDisputadas: 1 });
    expect(campeonato.proximaCorrida).toMatchObject({
      nome: 'GP de São Paulo',
      cidade: 'São Paulo',
    });
    expect(campeonato.proximaCorrida?.sessoes.map((s) => s.nome)).toEqual([
      'Sprint',
      'Classificação',
      'Corrida',
    ]);
    expect(campeonato.pilotos).toEqual([
      { posicao: 1, nome: 'Lando Norris', equipe: 'McLaren', pontos: 25, vitorias: 1 },
      { posicao: 2, nome: 'Sem Posição', equipe: '', pontos: 0, vitorias: 0 },
    ]);
    expect(campeonato.ultimaCorrida?.podio.map((p) => p.nome)).toEqual([
      'Piloto 1',
      'Piloto 2',
      'Piloto 3',
    ]);
  });
});
