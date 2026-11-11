import { z } from 'zod';
import type {
  Campeonato,
  Corrida,
  FonteDoCampeonato,
  Sessao,
} from '../../application/ports/fonte-do-campeonato.js';
import { buscarJson } from '../http-externo.js';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1/current';

const momento = z.object({ date: z.iso.date(), time: z.string().optional() });

const NOMES_DAS_SESSOES = {
  FirstPractice: 'Treino livre 1',
  SecondPractice: 'Treino livre 2',
  ThirdPractice: 'Treino livre 3',
  SprintQualifying: 'Classificação sprint',
  SprintShootout: 'Classificação sprint',
  Sprint: 'Sprint',
  Qualifying: 'Classificação',
} as const;

const corridaJolpica = z.object({
  round: z.coerce.number().int(),
  raceName: z.string(),
  date: z.iso.date(),
  time: z.string().optional(),
  Circuit: z.object({
    circuitName: z.string(),
    Location: z.object({ locality: z.string(), country: z.string() }),
  }),
  ...Object.fromEntries(Object.keys(NOMES_DAS_SESSOES).map((chave) => [chave, momento.optional()])),
});

const calendario = z.object({
  MRData: z.object({
    RaceTable: z.object({ season: z.coerce.number().int(), Races: z.array(corridaJolpica) }),
  }),
});

const nomeDoPiloto = z.object({ givenName: z.string(), familyName: z.string() });

const classificacaoDePilotos = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(
        z.object({
          round: z.coerce.number().int(),
          DriverStandings: z.array(
            z.object({
              position: z.coerce.number().int().optional(),
              points: z.coerce.number(),
              wins: z.coerce.number().int(),
              Driver: nomeDoPiloto,
              Constructors: z.array(z.object({ name: z.string() })),
            }),
          ),
        }),
      ),
    }),
  }),
});

const classificacaoDeConstrutores = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(
        z.object({
          ConstructorStandings: z.array(
            z.object({
              position: z.coerce.number().int().optional(),
              points: z.coerce.number(),
              wins: z.coerce.number().int(),
              Constructor: z.object({ name: z.string() }),
            }),
          ),
        }),
      ),
    }),
  }),
});

const ultimoResultado = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          raceName: z.string(),
          date: z.iso.date(),
          Results: z.array(
            z.object({
              position: z.coerce.number().int(),
              Driver: nomeDoPiloto,
              Constructor: z.object({ name: z.string() }),
            }),
          ),
        }),
      ),
    }),
  }),
});

function instante(data: string, hora: string | undefined) {
  return new Date(`${data}T${hora ?? '00:00:00Z'}`);
}

function nome({ givenName, familyName }: z.infer<typeof nomeDoPiloto>) {
  return `${givenName} ${familyName}`;
}

function paraCorrida(corrida: z.infer<typeof corridaJolpica>): Corrida {
  const registro = corrida as Record<string, unknown>;
  const sessoes: Sessao[] = [];

  for (const [chave, nomeDaSessao] of Object.entries(NOMES_DAS_SESSOES)) {
    const sessao = momento.safeParse(registro[chave]);

    if (sessao.success) {
      sessoes.push({ nome: nomeDaSessao, inicio: instante(sessao.data.date, sessao.data.time) });
    }
  }

  const inicio = instante(corrida.date, corrida.time);
  sessoes.push({ nome: 'Corrida', inicio });

  return {
    rodada: corrida.round,
    nome: corrida.raceName,
    circuito: corrida.Circuit.circuitName,
    cidade: corrida.Circuit.Location.locality,
    pais: corrida.Circuit.Location.country,
    inicio,
    sessoes: sessoes.toSorted((a, b) => a.inicio.getTime() - b.inicio.getTime()),
  };
}

export class FonteCampeonatoJolpica implements FonteDoCampeonato {
  async buscarCampeonato(agora: Date): Promise<Campeonato> {
    const [agenda, pilotos, construtores, ultima] = await Promise.all([
      buscarJson(`${JOLPICA}.json`, calendario),
      buscarJson(`${JOLPICA}/driverStandings.json?limit=30`, classificacaoDePilotos),
      buscarJson(`${JOLPICA}/constructorStandings.json?limit=30`, classificacaoDeConstrutores),
      buscarJson(`${JOLPICA}/last/results.json?limit=3`, ultimoResultado),
    ]);
    const corridas = agenda.MRData.RaceTable.Races.map(paraCorrida);
    const tabelaDePilotos = pilotos.MRData.StandingsTable.StandingsLists[0];
    const tabelaDeConstrutores = construtores.MRData.StandingsTable.StandingsLists[0];
    const corridaAnterior = ultima.MRData.RaceTable.Races[0];

    return {
      ano: agenda.MRData.RaceTable.season,
      totalDeRodadas: corridas.length,
      rodadasDisputadas: tabelaDePilotos?.round ?? 0,
      proximaCorrida: corridas.find((corrida) => corrida.inicio > agora) ?? null,
      pilotos: (tabelaDePilotos?.DriverStandings ?? []).map((linha, indice) => ({
        posicao: linha.position ?? indice + 1,
        nome: nome(linha.Driver),
        equipe: linha.Constructors.at(-1)?.name ?? '',
        pontos: linha.points,
        vitorias: linha.wins,
      })),
      construtores: (tabelaDeConstrutores?.ConstructorStandings ?? []).map((linha, indice) => ({
        posicao: linha.position ?? indice + 1,
        nome: linha.Constructor.name,
        pontos: linha.points,
        vitorias: linha.wins,
      })),
      ultimaCorrida: corridaAnterior
        ? {
            nome: corridaAnterior.raceName,
            data: new Date(`${corridaAnterior.date}T00:00:00Z`),
            podio: corridaAnterior.Results.filter((r) => r.position <= 3).map((r) => ({
              posicao: r.position,
              nome: nome(r.Driver),
              equipe: r.Constructor.name,
            })),
          }
        : null,
    };
  }
}
