import { z } from 'zod';
import type {
  EquipeDaHistoria,
  FonteDasEquipes,
  NumerosDaEquipe,
} from '../../application/ports/fonte-das-equipes.js';
import { comCache } from '../cache/com-cache.js';
import { buscarJson } from '../http-externo.js';
import { paisDaNacionalidade } from './nacionalidades.js';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const POR_PAGINA = 100;
const UM_DIA_EM_MS = 24 * 60 * 60_000;
const WIKIPEDIA_EM_INGLES = /^https?:\/\/en\.wikipedia\.org\/wiki\/(.+)$/;

const listaDeEquipes = z.object({
  MRData: z.object({
    total: z.coerce.number().int(),
    ConstructorTable: z.object({
      Constructors: z.array(
        z.object({
          constructorId: z.string().regex(/^[A-Za-z0-9_-]+$/),
          name: z.string(),
          nationality: z.string().optional(),
          url: z.string().optional(),
        }),
      ),
    }),
  }),
});

const total = z.object({ MRData: z.object({ total: z.coerce.number().int() }) });

const temporadas = z.object({
  MRData: z.object({
    SeasonTable: z.object({
      Seasons: z.array(z.object({ season: z.coerce.number().int() })),
    }),
  }),
});

function artigo(url: string | undefined) {
  const encontrado = url?.match(WIKIPEDIA_EM_INGLES)?.[1];

  return encontrado ? decodeURIComponent(encontrado).replaceAll('_', ' ') : null;
}

export class FonteEquipesJolpica implements FonteDasEquipes {
  readonly listar = comCache(async (): Promise<EquipeDaHistoria[]> => {
    const equipes: EquipeDaHistoria[] = [];
    let quantas = Number.POSITIVE_INFINITY;

    for (let offset = 0; offset < quantas; offset += POR_PAGINA) {
      const pagina = await buscarJson(
        `${JOLPICA}/constructors.json?limit=${POR_PAGINA}&offset=${offset}`,
        listaDeEquipes,
      );
      quantas = pagina.MRData.total;
      equipes.push(
        ...pagina.MRData.ConstructorTable.Constructors.map((equipe) => ({
          id: equipe.constructorId,
          nome: equipe.name.replaceAll('&amp;', '&'),
          pais: paisDaNacionalidade(equipe.nationality),
          wikipedia: artigo(equipe.url),
        })),
      );
    }

    return equipes;
  }, UM_DIA_EM_MS);

  async numeros(id: string): Promise<NumerosDaEquipe> {
    const base = `${JOLPICA}/constructors/${encodeURIComponent(id)}`;
    const [anos, corridas, vitorias, segundos, terceiros, poles] = await Promise.all([
      buscarJson(`${base}/seasons.json?limit=100`, temporadas),
      buscarJson(`${base}/races.json?limit=1`, total),
      buscarJson(`${base}/results/1.json?limit=1`, total),
      buscarJson(`${base}/results/2.json?limit=1`, total),
      buscarJson(`${base}/results/3.json?limit=1`, total),
      buscarJson(`${base}/grid/1/results.json?limit=1`, total),
    ]);

    return {
      temporadas: anos.MRData.SeasonTable.Seasons.map((temporada) => temporada.season),
      corridas: corridas.MRData.total,
      vitorias: vitorias.MRData.total,
      podios: vitorias.MRData.total + segundos.MRData.total + terceiros.MRData.total,
      poles: poles.MRData.total,
    };
  }
}
