import { setTimeout as esperar } from 'node:timers/promises';
import { z } from 'zod';
import type {
  Campeao,
  Carreira,
  FonteDaHistoria,
  TemporadaHistorica,
} from '../../application/ports/fonte-da-historia.js';
import { comCache } from '../cache/com-cache.js';
import { buscarJson } from '../http-externo.js';
import { paisDaNacionalidade } from './nacionalidades.js';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const PAUSA_ENTRE_ANOS_EM_MS = 1100;

const piloto = z.object({
  code: z.string().length(3).optional(),
  givenName: z.string(),
  familyName: z.string(),
  nationality: z.string().optional(),
});

const construtor = z.object({ name: z.string() });

const linhaDePiloto = z.object({
  position: z.coerce.number().int().optional(),
  points: z.coerce.number(),
  wins: z.coerce.number().int(),
  Driver: piloto,
  Constructors: z.array(construtor),
});

const linhaDeConstrutor = z.object({
  position: z.coerce.number().int().optional(),
  points: z.coerce.number(),
  wins: z.coerce.number().int(),
  Constructor: construtor,
});

const classificacaoDePilotos = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(z.object({ DriverStandings: z.array(linhaDePiloto) })),
    }),
  }),
});

const classificacaoDeConstrutores = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(z.object({ ConstructorStandings: z.array(linhaDeConstrutor) })),
    }),
  }),
});

const corridas = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          round: z.coerce.number().int(),
          raceName: z.string(),
          date: z.iso.date(),
          Circuit: z.object({
            circuitName: z.string(),
            Location: z.object({ country: z.string() }),
          }),
        }),
      ),
    }),
  }),
});

const vencedores = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          round: z.coerce.number().int(),
          Results: z.array(z.object({ Driver: piloto, Constructor: construtor })),
        }),
      ),
    }),
  }),
});

const POR_PAGINA = 100;
const UM_DIA_EM_MS = 24 * 60 * 60_000;

const listaDePilotos = z.object({
  MRData: z.object({
    total: z.coerce.number().int(),
    DriverTable: z.object({
      Drivers: z.array(
        z.object({
          driverId: z.string().regex(/^[A-Za-z0-9_-]+$/),
          givenName: z.string(),
          familyName: z.string(),
          dateOfBirth: z.iso.date().optional(),
        }),
      ),
    }),
  }),
});

type PilotoJolpica = z.infer<typeof listaDePilotos>['MRData']['DriverTable']['Drivers'][number];

const total = z.object({ MRData: z.object({ total: z.coerce.number().int() }) });

const temporadas = z.object({
  MRData: z.object({
    SeasonTable: z.object({
      Seasons: z.array(z.object({ season: z.coerce.number().int() })),
    }),
  }),
});

function chaveDoNome(nomeCompleto: string) {
  return nomeCompleto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

function nome({ givenName, familyName }: z.infer<typeof piloto>) {
  return `${givenName} ${familyName}`;
}

function pilotosDe(resposta: z.infer<typeof classificacaoDePilotos>) {
  return resposta.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

function construtoresDe(resposta: z.infer<typeof classificacaoDeConstrutores>) {
  return resposta.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export class FonteHistoriaJolpica implements FonteDaHistoria {
  private readonly pilotosPorNome = comCache(async () => {
    const porNome = new Map<string, PilotoJolpica>();
    let quantos = Number.POSITIVE_INFINITY;

    for (let offset = 0; offset < quantos; offset += POR_PAGINA) {
      const pagina = await buscarJson(
        `${JOLPICA}/drivers.json?limit=${POR_PAGINA}&offset=${offset}`,
        listaDePilotos,
      );
      quantos = pagina.MRData.total;

      for (const dados of pagina.MRData.DriverTable.Drivers) {
        porNome.set(chaveDoNome(nome(dados)), dados);
      }
    }

    return porNome;
  }, UM_DIA_EM_MS);

  async buscarCarreira(nomeDoPiloto: string): Promise<Carreira | null> {
    const dados = (await this.pilotosPorNome()).get(chaveDoNome(nomeDoPiloto));

    if (!dados) {
      return null;
    }

    const base = `${JOLPICA}/drivers/${encodeURIComponent(dados.driverId)}`;
    const [corridas, vitorias, segundos, terceiros, poles, anos] = await Promise.all([
      buscarJson(`${base}/results.json?limit=1`, total),
      buscarJson(`${base}/results/1.json?limit=1`, total),
      buscarJson(`${base}/results/2.json?limit=1`, total),
      buscarJson(`${base}/results/3.json?limit=1`, total),
      buscarJson(`${base}/grid/1/results.json?limit=1`, total),
      buscarJson(`${base}/seasons.json?limit=100`, temporadas),
    ]);
    const disputadas = anos.MRData.SeasonTable.Seasons.map((temporada) => temporada.season);

    return {
      nascimento: dados.dateOfBirth ?? null,
      estreia: Math.min(...disputadas),
      temporadas: disputadas.length,
      corridas: corridas.MRData.total,
      vitorias: vitorias.MRData.total,
      podios: vitorias.MRData.total + segundos.MRData.total + terceiros.MRData.total,
      poles: poles.MRData.total,
    };
  }

  async buscarCampeoes(anos: number[]): Promise<Campeao[]> {
    const campeoes: Campeao[] = [];

    for (const [indice, ano] of anos.entries()) {
      if (indice > 0) {
        await esperar(PAUSA_ENTRE_ANOS_EM_MS);
      }

      const [pilotos, construtores] = await Promise.all([
        buscarJson(`${JOLPICA}/${ano}/driverstandings/1.json`, classificacaoDePilotos),
        buscarJson(`${JOLPICA}/${ano}/constructorstandings/1.json`, classificacaoDeConstrutores),
      ]);
      const [campeao] = pilotosDe(pilotos);
      const [equipeCampea] = construtoresDe(construtores);

      if (campeao) {
        campeoes.push({
          ano,
          sigla: campeao.Driver.code ?? null,
          piloto: nome(campeao.Driver),
          pais: paisDaNacionalidade(campeao.Driver.nationality),
          equipe: campeao.Constructors.at(-1)?.name ?? '',
          pontos: campeao.points,
          vitorias: campeao.wins,
          construtor: equipeCampea
            ? {
                nome: equipeCampea.Constructor.name,
                pontos: equipeCampea.points,
                vitorias: equipeCampea.wins,
              }
            : null,
        });
      }
    }

    return campeoes;
  }

  async buscarTemporada(ano: number): Promise<TemporadaHistorica> {
    const [agenda, primeiros, pilotos, construtores] = await Promise.all([
      buscarJson(`${JOLPICA}/${ano}.json?limit=100`, corridas),
      buscarJson(`${JOLPICA}/${ano}/results/1.json?limit=100`, vencedores),
      buscarJson(`${JOLPICA}/${ano}/driverstandings.json?limit=100`, classificacaoDePilotos),
      buscarJson(
        `${JOLPICA}/${ano}/constructorstandings.json?limit=100`,
        classificacaoDeConstrutores,
      ),
    ]);
    const vencedorPorRodada = new Map(
      primeiros.MRData.RaceTable.Races.map((corrida) => [corrida.round, corrida.Results[0]]),
    );

    return {
      ano,
      corridas: agenda.MRData.RaceTable.Races.map((corrida) => {
        const vencedor = vencedorPorRodada.get(corrida.round);

        return {
          rodada: corrida.round,
          nome: corrida.raceName,
          circuito: corrida.Circuit.circuitName,
          pais: corrida.Circuit.Location.country,
          data: corrida.date,
          vencedor: vencedor
            ? { nome: nome(vencedor.Driver), equipe: vencedor.Constructor.name }
            : null,
        };
      }),
      pilotos: pilotosDe(pilotos).map((linha, indice) => ({
        posicao: linha.position ?? indice + 1,
        nome: nome(linha.Driver),
        pais: paisDaNacionalidade(linha.Driver.nationality),
        equipes: linha.Constructors.map((equipe) => equipe.name),
        pontos: linha.points,
        vitorias: linha.wins,
      })),
      construtores: construtoresDe(construtores).map((linha, indice) => ({
        posicao: linha.position ?? indice + 1,
        nome: linha.Constructor.name,
        pontos: linha.points,
        vitorias: linha.wins,
      })),
    };
  }
}
