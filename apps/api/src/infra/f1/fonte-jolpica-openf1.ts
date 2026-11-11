import { setTimeout as esperar } from 'node:timers/promises';
import { z } from 'zod';
import type {
  FonteDeDadosDaF1,
  PilotoDaTemporada,
  Temporada,
} from '../../application/ports/fonte-de-dados-da-f1.js';
import type { DadosEquipe } from '../../domain/equipe.js';
import { paisDaNacionalidade } from './nacionalidades.js';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const OPENF1 = 'https://api.openf1.org/v1';
const TEMPORADAS_PARA_CONTAR_TITULOS = 30;
const CONSULTAS_POR_LOTE = 2;
const PAUSA_ENTRE_LOTES_EM_MS = 1100;
const TEMPO_LIMITE_EM_MS = 15_000;
const TENTATIVAS_EXTRAS = 3;
const ESPERA_MAXIMA_EM_S = 10;
const STATUS_TEMPORARIOS = new Set([429, 502, 503, 504]);

const pilotosOpenF1 = z.array(
  z.object({
    driver_number: z.number().int().min(0).max(99),
    name_acronym: z.string().length(3),
    full_name: z.string().min(1).max(255),
    team_name: z.string().min(1).max(100),
    team_colour: z
      .string()
      .regex(/^[0-9a-fA-F]{6}$/)
      .nullable(),
  }),
);

const pilotoJolpica = z.object({
  code: z.string().length(3).optional(),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  nationality: z.string().optional(),
});

const pilotosJolpica = z.object({
  MRData: z.object({
    DriverTable: z.object({
      season: z.coerce.number().int(),
      Drivers: z.array(pilotoJolpica),
    }),
  }),
});

const campeaoJolpica = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(
        z.object({ DriverStandings: z.array(z.object({ Driver: pilotoJolpica })).min(1) }),
      ),
    }),
  }),
});

export class FonteIndisponivel extends Error {
  constructor(url: string, causa: unknown) {
    super(`Não foi possível obter os dados de ${new URL(url).host}.`, { cause: causa });
    this.name = 'FonteIndisponivel';
  }
}

function esperaAntesDeTentarDeNovo(resposta: Response, tentativa: number) {
  const pedida = Number(resposta.headers.get('retry-after'));

  return Number.isFinite(pedida) && pedida > 0
    ? Math.min(pedida, ESPERA_MAXIMA_EM_S) * 1000
    : 1000 * 2 ** tentativa;
}

async function buscarJson<Schema extends z.ZodType>(url: string, schema: Schema) {
  try {
    for (let tentativa = 0; ; tentativa++) {
      const resposta = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'DRS (github.com/mtepeaceful/DRS)' },
        signal: AbortSignal.timeout(TEMPO_LIMITE_EM_MS),
      });

      if (STATUS_TEMPORARIOS.has(resposta.status) && tentativa < TENTATIVAS_EXTRAS) {
        await esperar(esperaAntesDeTentarDeNovo(resposta, tentativa));
        continue;
      }

      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
      }

      return schema.parse(await resposta.json()) as z.output<Schema>;
    }
  } catch (erro) {
    throw new FonteIndisponivel(url, erro);
  }
}

function corDeContraste(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0a0a0b' : '#ffffff';
}

function capitalizar(nomeCompleto: string) {
  return nomeCompleto
    .toLowerCase()
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, separador: string, letra: string) => separador + letra.toUpperCase(),
    );
}

export class FonteJolpicaOpenF1 implements FonteDeDadosDaF1 {
  async buscarTemporadaAtual(): Promise<Temporada> {
    const [grid, jolpica] = await Promise.all([
      buscarJson(`${OPENF1}/drivers?session_key=latest`, pilotosOpenF1),
      buscarJson(`${JOLPICA}/current/drivers.json?limit=100`, pilotosJolpica),
    ]);
    const { season: ano, Drivers } = jolpica.MRData.DriverTable;
    const porSigla = new Map(Drivers.filter((p) => p.code).map((p) => [p.code, p]));
    const titulos = await this.contarTitulos(ano);

    const equipes = new Map<string, DadosEquipe>();
    const pilotos: PilotoDaTemporada[] = [];

    for (const piloto of grid) {
      const cor = `#${(piloto.team_colour ?? '8a8d96').toLowerCase()}`;

      if (!equipes.has(piloto.team_name)) {
        equipes.set(piloto.team_name, {
          nome: piloto.team_name,
          cor,
          corSecundaria: corDeContraste(cor),
        });
      }

      const dados = porSigla.get(piloto.name_acronym);

      pilotos.push({
        nome: dados ? `${dados.givenName} ${dados.familyName}` : capitalizar(piloto.full_name),
        numero: piloto.driver_number,
        pais: paisDaNacionalidade(dados?.nationality),
        titulos: titulos.get(piloto.name_acronym) ?? 0,
        equipe: piloto.team_name,
      });
    }

    return { ano, equipes: [...equipes.values()], pilotos };
  }

  private async contarTitulos(anoAtual: number) {
    const anos = Array.from(
      { length: TEMPORADAS_PARA_CONTAR_TITULOS },
      (_, i) => anoAtual - TEMPORADAS_PARA_CONTAR_TITULOS + i,
    );
    const titulos = new Map<string, number>();

    for (let inicio = 0; inicio < anos.length; inicio += CONSULTAS_POR_LOTE) {
      const lote = anos.slice(inicio, inicio + CONSULTAS_POR_LOTE);
      const respostas = await Promise.all(
        lote.map((ano) => buscarJson(`${JOLPICA}/${ano}/driverstandings/1.json`, campeaoJolpica)),
      );

      for (const resposta of respostas) {
        const sigla =
          resposta.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0]?.Driver.code;

        if (sigla) {
          titulos.set(sigla, (titulos.get(sigla) ?? 0) + 1);
        }
      }

      if (inicio + CONSULTAS_POR_LOTE < anos.length) {
        await esperar(PAUSA_ENTRE_LOTES_EM_MS);
      }
    }

    return titulos;
  }
}
