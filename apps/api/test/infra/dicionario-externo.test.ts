import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteEquipesJolpica } from '../../src/infra/f1/fonte-equipes-jolpica.js';
import { buscarJsonSeExistir, FonteIndisponivel } from '../../src/infra/http-externo.js';
import { EnciclopediaWikimedia } from '../../src/infra/wiki/enciclopedia-wikimedia.js';
import { z } from 'zod';

vi.mock('node:timers/promises', () => ({ setTimeout: async () => undefined }));

afterEach(() => vi.restoreAllMocks());

function responder(resposta: (url: URL) => Response) {
  const pedidos: URL[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada) => {
    const url = new URL(String(entrada));
    pedidos.push(url);

    return resposta(url);
  });

  return pedidos;
}

describe('buscarJsonSeExistir', () => {
  it('devolve nulo só quando a página não existe', async () => {
    responder((url) =>
      url.pathname === '/ausente'
        ? new Response(null, { status: 404 })
        : new Response(null, { status: 500 }),
    );

    await expect(
      buscarJsonSeExistir('https://exemplo.org/ausente', z.object({})),
    ).resolves.toBeNull();
    await expect(buscarJsonSeExistir('https://exemplo.org/quebrada', z.object({}))).rejects.toThrow(
      FonteIndisponivel,
    );
  });
});

describe('FonteEquipesJolpica', () => {
  it('percorre todas as páginas e guarda o artigo da Wikipédia de cada equipe', async () => {
    const pedidos = responder((url) => {
      const offset = Number(url.searchParams.get('offset'));
      const equipes =
        offset === 0
          ? [
              {
                constructorId: 'team_lotus',
                name: 'Team Lotus',
                nationality: 'British',
                url: 'http://en.wikipedia.org/wiki/Team_Lotus',
              },
            ]
          : [{ constructorId: 'emw', name: 'EMW', nationality: 'East German' }];

      return Response.json({
        MRData: { total: '101', ConstructorTable: { Constructors: equipes } },
      });
    });

    const equipes = await new FonteEquipesJolpica().listar();

    expect(equipes).toEqual([
      { id: 'team_lotus', nome: 'Team Lotus', pais: 'GB', wikipedia: 'Team Lotus' },
      { id: 'emw', nome: 'EMW', pais: null, wikipedia: null },
    ]);
    expect(pedidos).toHaveLength(2);
  });

  it('soma os pódios e lista as temporadas da equipe', async () => {
    const totais: Record<string, string> = {
      'races.json': '395',
      '1.json': '45',
      '2.json': '35',
      '3.json': '27',
      'results.json': '107',
    };
    responder((url) => {
      if (url.pathname.endsWith('/seasons.json')) {
        return Response.json({
          MRData: { SeasonTable: { Seasons: [{ season: '1958' }, { season: '1994' }] } },
        });
      }

      const arquivo = url.pathname.includes('/grid/1/')
        ? 'results.json'
        : (url.pathname.split('/').pop() ?? '');

      return Response.json({ MRData: { total: totais[arquivo] } });
    });

    expect(await new FonteEquipesJolpica().numeros('team_lotus')).toEqual({
      temporadas: [1958, 1994],
      corridas: 395,
      vitorias: 45,
      podios: 107,
      poles: 107,
    });
  });
});

describe('EnciclopediaWikimedia', () => {
  function wikidata(entidades: Record<string, unknown>) {
    return Response.json({ entities: entidades });
  }

  it('usa fundador e sede da empresa-mãe quando a equipe não tem', async () => {
    responder((url) => {
      if (url.hostname === 'www.wikidata.org') {
        const ids = url.searchParams.get('ids');

        if (url.searchParams.get('titles')) {
          return wikidata({
            Q169898: {
              claims: {
                P749: [{ mainsnak: { datavalue: { value: { id: 'Q27586' } } } }],
                P571: [{ mainsnak: { datavalue: { value: { time: '+1929-01-01T00:00:00Z' } } } }],
              },
              sitelinks: { ptwiki: { title: 'Scuderia Ferrari' } },
            },
          });
        }

        if (ids === 'Q27586') {
          return wikidata({
            Q27586: {
              claims: {
                P112: [{ mainsnak: { datavalue: { value: { id: 'Q181282' } } } }],
                P159: [{ mainsnak: { datavalue: { value: { id: 'Q100060' } } } }],
              },
            },
          });
        }

        return wikidata({
          Q181282: { labels: { pt: { value: 'Enzo Ferrari' } } },
          Q100060: { labels: { en: { value: 'Maranello' } } },
        });
      }

      return Response.json({
        extract: 'A Scuderia Ferrari é a equipe mais antiga em atividade.',
        content_urls: { desktop: { page: 'https://pt.wikipedia.org/wiki/Scuderia_Ferrari' } },
      });
    });

    expect(await new EnciclopediaWikimedia().verbete('Scuderia Ferrari')).toEqual({
      resumo: 'A Scuderia Ferrari é a equipe mais antiga em atividade.',
      fonte: 'https://pt.wikipedia.org/wiki/Scuderia_Ferrari',
      fundacao: 1929,
      fundadores: ['Enzo Ferrari'],
      sede: 'Maranello',
    });
  });

  it('cai para a Wikipédia em inglês quando não há artigo em português', async () => {
    const pedidos = responder((url) => {
      if (url.hostname === 'www.wikidata.org') {
        return wikidata({ Q1: { claims: {}, sitelinks: {} } });
      }

      return Response.json({
        extract: 'EMW was an East German team.',
        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/EMW' } },
      });
    });

    const verbete = await new EnciclopediaWikimedia().verbete('EMW');

    expect(verbete).toMatchObject({
      resumo: 'EMW was an East German team.',
      fundadores: [],
      sede: null,
    });
    expect(pedidos.map((url) => url.hostname)).toEqual(['www.wikidata.org', 'en.wikipedia.org']);
  });
});
