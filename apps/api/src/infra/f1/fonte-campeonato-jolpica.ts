import { z } from 'zod';
import type {
  Campeonato,
  Corrida,
  Etapa,
  FonteDoCampeonato,
  LinhaDaQualificacao,
  LinhaDoResultado,
  Participacao,
  ResultadoDaEtapa,
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
          round: z.coerce.number().int(),
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

const linhaDoResultado = z.object({
  number: z.coerce.number().int(),
  position: z.coerce.number().int(),
  positionText: z.string(),
  points: z.coerce.number(),
  grid: z.coerce.number().int(),
  laps: z.coerce.number().int(),
  status: z.string(),
  Time: z.object({ time: z.string() }).optional(),
  FastestLap: z.object({ rank: z.coerce.number().int() }).optional(),
  Driver: nomeDoPiloto,
  Constructor: z.object({ name: z.string() }),
});

const resultadosDaTemporada = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({ round: z.coerce.number().int(), Results: z.array(linhaDoResultado) }),
      ),
    }),
  }),
});

const POR_PAGINA = 100;

const tempoDeVolta = z
  .string()
  .optional()
  .transform((tempo) => tempo || null);

const qualificacaoDaEtapa = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          QualifyingResults: z.array(
            z.object({
              number: z.coerce.number().int(),
              position: z.coerce.number().int(),
              Driver: nomeDoPiloto,
              Constructor: z.object({ name: z.string() }),
              Q1: tempoDeVolta,
              Q2: tempoDeVolta,
              Q3: tempoDeVolta,
            }),
          ),
        }),
      ),
    }),
  }),
});

const sprintDaEtapa = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(z.object({ SprintResults: z.array(linhaDoResultado) })),
    }),
  }),
});

function classificacaoFinal(linhas: z.infer<typeof linhaDoResultado>[]) {
  const voltasDoVencedor = linhas[0]?.laps ?? 0;

  return linhas.map((linha) => paraLinha(linha, voltasDoVencedor));
}

const paginaDeResultados = z.object({
  MRData: z.object({
    total: z.coerce.number().int().min(0),
    RaceTable: z.object({
      Races: z.array(
        z.object({
          round: z.coerce.number().int(),
          Results: z.array(linhaDoResultado).optional(),
          SprintResults: z.array(linhaDoResultado).optional(),
        }),
      ),
    }),
  }),
});

async function todasAsPaginas(recurso: 'results' | 'sprint') {
  const corridas: z.infer<typeof paginaDeResultados>['MRData']['RaceTable']['Races'] = [];
  let total = Number.POSITIVE_INFINITY;

  for (let offset = 0; offset < total; offset += POR_PAGINA) {
    const pagina = await buscarJson(
      `${JOLPICA}/${recurso}.json?limit=${POR_PAGINA}&offset=${offset}`,
      paginaDeResultados,
    );
    total = pagina.MRData.total;
    corridas.push(...pagina.MRData.RaceTable.Races);
  }

  return corridas.flatMap((corrida) =>
    (corrida.Results ?? corrida.SprintResults ?? []).map((linha): Participacao => ({
      rodada: corrida.round,
      tipo: recurso === 'results' ? 'corrida' : 'sprint',
      nome: nome(linha.Driver),
      equipe: linha.Constructor.name,
      posicao: linha.position,
      classificado: /^\d+$/.test(linha.positionText),
      largada: linha.grid,
      pontos: linha.points,
    })),
  );
}

const SITUACOES: Record<string, string> = {
  Finished: 'Completou',
  Lapped: 'Retardatário',
  Retired: 'Abandonou',
  'Did not start': 'Não largou',
  'Did not finish': 'Abandonou',
  Disqualified: 'Desclassificado',
  Withdrew: 'Retirou-se',
};

function paraLinha(
  linha: z.infer<typeof linhaDoResultado>,
  voltasDoVencedor: number,
): LinhaDoResultado {
  const voltasAtras = voltasDoVencedor - linha.laps;
  const classificado = /^\d+$/.test(linha.positionText);

  return {
    posicao: linha.position,
    classificado,
    nome: nome(linha.Driver),
    numero: linha.number,
    equipe: linha.Constructor.name,
    largada: linha.grid,
    voltas: linha.laps,
    tempo: voltasAtras > 0 ? null : (linha.Time?.time ?? null),
    situacao:
      linha.status === 'Lapped' && voltasAtras > 0
        ? `+${voltasAtras} ${voltasAtras === 1 ? 'volta' : 'voltas'}`
        : (SITUACOES[linha.status] ?? linha.status),
    pontos: linha.points,
    voltaMaisRapida: linha.FastestLap?.rank === 1,
  };
}

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
  async buscarCalendario(): Promise<Etapa[]> {
    const [agenda, vencedores] = await Promise.all([
      buscarJson(`${JOLPICA}.json`, calendario),
      buscarJson(`${JOLPICA}/results/1.json?limit=100`, resultadosDaTemporada),
    ]);
    const vencedorPorRodada = new Map(
      vencedores.MRData.RaceTable.Races.map((corrida) => [corrida.round, corrida.Results[0]]),
    );

    return agenda.MRData.RaceTable.Races.map((corrida) => {
      const vencedor = vencedorPorRodada.get(corrida.round);

      return {
        ...paraCorrida(corrida),
        vencedor: vencedor
          ? { nome: nome(vencedor.Driver), equipe: vencedor.Constructor.name }
          : null,
      };
    });
  }

  async buscarResultado(rodada: number): Promise<ResultadoDaEtapa | null> {
    const agenda = await buscarJson(`${JOLPICA}.json`, calendario);
    const corrida = agenda.MRData.RaceTable.Races.find((etapa) => etapa.round === rodada);

    if (!corrida) {
      return null;
    }

    const [resultado, sprint, qualificacao] = await Promise.all([
      buscarJson(`${JOLPICA}/${rodada}/results.json?limit=40`, resultadosDaTemporada),
      buscarJson(`${JOLPICA}/${rodada}/sprint.json?limit=40`, sprintDaEtapa),
      buscarJson(`${JOLPICA}/${rodada}/qualifying.json?limit=40`, qualificacaoDaEtapa),
    ]);

    return {
      etapa: paraCorrida(corrida),
      classificacao: classificacaoFinal(resultado.MRData.RaceTable.Races[0]?.Results ?? []),
      sprint: classificacaoFinal(sprint.MRData.RaceTable.Races[0]?.SprintResults ?? []),
      qualificacao: (qualificacao.MRData.RaceTable.Races[0]?.QualifyingResults ?? []).map(
        (linha): LinhaDaQualificacao => ({
          posicao: linha.position,
          nome: nome(linha.Driver),
          numero: linha.number,
          equipe: linha.Constructor.name,
          q1: linha.Q1,
          q2: linha.Q2,
          q3: linha.Q3,
        }),
      ),
    };
  }

  async buscarParticipacoes(): Promise<Participacao[]> {
    const corridas = await todasAsPaginas('results');
    const sprints = await todasAsPaginas('sprint');

    return [...corridas, ...sprints];
  }

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
            rodada: corridaAnterior.round,
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
