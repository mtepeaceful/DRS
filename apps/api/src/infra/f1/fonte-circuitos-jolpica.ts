import { z } from 'zod';
import type {
  Circuito,
  FonteDosCircuitos,
  VitoriaNoCircuito,
} from '../../application/ports/fonte-dos-circuitos.js';
import { comCache } from '../cache/com-cache.js';
import { buscarJson } from '../http-externo.js';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const POR_PAGINA = 100;
const UM_DIA_EM_MS = 24 * 60 * 60_000;
const WIKIPEDIA_EM_INGLES = /^https?:\/\/en\.wikipedia\.org\/wiki\/(.+)$/;

const listaDeCircuitos = z.object({
  MRData: z.object({
    total: z.coerce.number().int(),
    CircuitTable: z.object({
      Circuits: z.array(
        z.object({
          circuitId: z.string().regex(/^[A-Za-z0-9_-]+$/),
          circuitName: z.string(),
          url: z.string().optional(),
          Location: z.object({
            lat: z.coerce.number(),
            long: z.coerce.number(),
            locality: z.string(),
            country: z.string(),
          }),
        }),
      ),
    }),
  }),
});

const vencedores = z.object({
  MRData: z.object({
    total: z.coerce.number().int(),
    RaceTable: z.object({
      Races: z.array(
        z.object({
          season: z.coerce.number().int(),
          round: z.coerce.number().int(),
          raceName: z.string(),
          Results: z
            .array(
              z.object({
                Driver: z.object({ givenName: z.string(), familyName: z.string() }),
                Constructor: z.object({ name: z.string() }),
              }),
            )
            .min(1),
        }),
      ),
    }),
  }),
});

function artigo(url: string | undefined) {
  const encontrado = url?.match(WIKIPEDIA_EM_INGLES)?.[1];

  return encontrado ? decodeURIComponent(encontrado).replaceAll('_', ' ') : null;
}

async function paginas<Item>(
  caminho: string,
  ler: (offset: number) => Promise<{ total: number; itens: Item[] }>,
) {
  const itens: Item[] = [];
  let total = Number.POSITIVE_INFINITY;

  for (let offset = 0; offset < total; offset += POR_PAGINA) {
    const pagina = await ler(offset);
    total = pagina.total;
    itens.push(...pagina.itens);
  }

  return itens;
}

export class FonteCircuitosJolpica implements FonteDosCircuitos {
  readonly listar = comCache(
    (): Promise<Circuito[]> =>
      paginas('circuits', async (offset) => {
        const pagina = await buscarJson(
          `${JOLPICA}/circuits.json?limit=${POR_PAGINA}&offset=${offset}`,
          listaDeCircuitos,
        );

        return {
          total: pagina.MRData.total,
          itens: pagina.MRData.CircuitTable.Circuits.map((circuito) => ({
            id: circuito.circuitId,
            nome: circuito.circuitName,
            cidade: circuito.Location.locality,
            pais: circuito.Location.country,
            latitude: circuito.Location.lat,
            longitude: circuito.Location.long,
            wikipedia: artigo(circuito.url),
          })),
        };
      }),
    UM_DIA_EM_MS,
  );

  vencedores(id: string): Promise<VitoriaNoCircuito[]> {
    return paginas('results', async (offset) => {
      const pagina = await buscarJson(
        `${JOLPICA}/circuits/${encodeURIComponent(id)}/results/1.json?limit=${POR_PAGINA}&offset=${offset}`,
        vencedores,
      );

      return {
        total: pagina.MRData.total,
        itens: pagina.MRData.RaceTable.Races.map((corrida) => {
          const [vencedor] = corrida.Results;

          return {
            ano: corrida.season,
            rodada: corrida.round,
            gp: corrida.raceName,
            piloto: `${vencedor?.Driver.givenName} ${vencedor?.Driver.familyName}`,
            equipe: vencedor?.Constructor.name ?? '',
          };
        }),
      };
    });
  }
}
