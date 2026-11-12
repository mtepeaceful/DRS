import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteJolpicaOpenF1 } from '../../src/infra/f1/fonte-jolpica-openf1.js';
import { FonteIndisponivel } from '../../src/infra/http-externo.js';

vi.mock('node:timers/promises', () => ({ setTimeout: async () => undefined }));

const gridOpenF1 = [
  {
    driver_number: 44,
    name_acronym: 'HAM',
    full_name: 'Lewis HAMILTON',
    team_name: 'Ferrari',
    team_colour: 'ED1131',
  },
  {
    driver_number: 99,
    name_acronym: 'NOV',
    full_name: 'Novato DA SILVA',
    team_name: 'Haas F1 Team',
    team_colour: null,
  },
];

const pilotosJolpica = {
  MRData: {
    DriverTable: {
      season: '2026',
      Drivers: [
        { code: 'HAM', givenName: 'Lewis', familyName: 'Hamilton', nationality: 'British' },
        { givenName: 'Reserva', familyName: 'Sem Sigla' },
      ],
    },
  },
};

function campeao(sigla?: string) {
  return {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            DriverStandings: [
              { Driver: { ...(sigla && { code: sigla }), givenName: 'X', familyName: 'Y' } },
            ],
          },
        ],
      },
    },
  };
}

function responder(respostas: (url: string) => unknown) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
    const corpo = respostas(String(entrada));

    return corpo === undefined
      ? new Response('erro', { status: 503 })
      : new Response(JSON.stringify(corpo), { status: 200 });
  });
}

afterEach(() => vi.restoreAllMocks());

describe('FonteJolpicaOpenF1', () => {
  it('cruza as duas APIs pela sigla', async () => {
    const fetch = responder((url) => {
      if (url.includes('openf1')) return gridOpenF1;
      if (url.includes('/current/drivers')) return pilotosJolpica;
      return undefined;
    });

    const temporada = await new FonteJolpicaOpenF1().buscarTemporadaAtual();

    expect(temporada.ano).toBe(2026);
    expect(temporada.pilotos).toEqual([
      { nome: 'Lewis Hamilton', sigla: 'HAM', numero: 44, pais: 'GB', equipe: 'Ferrari' },
      { nome: 'Novato Da Silva', sigla: 'NOV', numero: 99, pais: null, equipe: 'Haas F1 Team' },
    ]);
    expect(temporada.equipes).toEqual([
      { nome: 'Ferrari', cor: '#ed1131', corSecundaria: '#ffffff' },
      { nome: 'Haas F1 Team', cor: '#8a8d96', corSecundaria: '#ffffff' },
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('busca o campeão de cada ano pedido', async () => {
    const fetch = responder((url) => {
      if (url.includes('/1996/')) return campeao();
      return campeao(url.includes('/2020/') ? 'HAM' : 'VER');
    });

    const campeoes = await new FonteJolpicaOpenF1().buscarCampeoes([1996, 2020, 2021]);

    expect(campeoes).toEqual([
      { ano: 1996, sigla: null },
      { ano: 2020, sigla: 'HAM' },
      { ano: 2021, sigla: 'VER' },
    ]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('espera e tenta de novo quando a API limita as requisições', async () => {
    const tentativas = new Map<string, number>();

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
      const url = String(entrada);
      const vez = (tentativas.get(url) ?? 0) + 1;
      tentativas.set(url, vez);

      if (url.includes('/2010/') && vez < 3) {
        return new Response('devagar', { status: 429, headers: { 'retry-after': '1' } });
      }

      return Response.json(campeao('VET'));
    });

    const campeoes = await new FonteJolpicaOpenF1().buscarCampeoes([2010, 2011]);

    expect(campeoes).toHaveLength(2);
    expect(tentativas.get('https://api.jolpi.ca/ergast/f1/2010/driverstandings/1.json')).toBe(3);
  });

  it('desiste depois de três novas tentativas', async () => {
    responder(() => undefined);

    await expect(new FonteJolpicaOpenF1().buscarCampeoes([2010])).rejects.toThrow(
      'Não foi possível obter os dados de api.jolpi.ca.',
    );
  });

  it('recusa resposta fora do formato esperado', async () => {
    responder((url) =>
      url.includes('openf1') ? [{ driver_number: 'quarenta e quatro' }] : pilotosJolpica,
    );

    await expect(new FonteJolpicaOpenF1().buscarTemporadaAtual()).rejects.toThrow(
      FonteIndisponivel,
    );
  });

  it('informa qual fonte falhou quando ela está fora do ar', async () => {
    responder((url) => (url.includes('openf1') ? undefined : pilotosJolpica));

    await expect(new FonteJolpicaOpenF1().buscarTemporadaAtual()).rejects.toThrow(
      'Não foi possível obter os dados de api.openf1.org.',
    );
  });
});
