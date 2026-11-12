import type { FonteDoCampeonato, Participacao } from '../ports/fonte-do-campeonato.js';

export interface DesempenhoNaEtapa {
  rodada: number;
  posicao: number | null;
  largada: number;
  pontos: number;
}

export interface DesempenhoDoPiloto {
  nome: string;
  equipe: string;
  posicao: number;
  pontos: number;
  vitorias: number;
  podios: number;
  poles: number;
  corridas: number;
  abandonos: number;
  melhorResultado: number | null;
  mediaDeChegada: number | null;
  etapas: DesempenhoNaEtapa[];
}

export interface DesempenhoDaTemporada {
  ano: number;
  rodadasDisputadas: number;
  pilotos: DesempenhoDoPiloto[];
}

function arredondar(valor: number) {
  return Math.round(valor * 10) / 10;
}

function calcular(nome: string, participacoes: Participacao[]) {
  const corridas = participacoes
    .filter((participacao) => participacao.tipo === 'corrida')
    .toSorted((a, b) => a.rodada - b.rodada);
  const chegadas = corridas.filter((corrida) => corrida.classificado).map((c) => c.posicao);
  const pontosNaSprint = new Map(
    participacoes
      .filter((participacao) => participacao.tipo === 'sprint')
      .map((sprint) => [sprint.rodada, sprint.pontos]),
  );

  return {
    nome,
    equipe: corridas.at(-1)?.equipe ?? participacoes.at(-1)?.equipe ?? '',
    pontos: participacoes.reduce((soma, participacao) => soma + participacao.pontos, 0),
    vitorias: chegadas.filter((posicao) => posicao === 1).length,
    podios: chegadas.filter((posicao) => posicao <= 3).length,
    poles: corridas.filter((corrida) => corrida.largada === 1).length,
    corridas: corridas.length,
    abandonos: corridas.length - chegadas.length,
    melhorResultado: chegadas.length > 0 ? Math.min(...chegadas) : null,
    mediaDeChegada:
      chegadas.length > 0
        ? arredondar(chegadas.reduce((soma, posicao) => soma + posicao, 0) / chegadas.length)
        : null,
    etapas: corridas.map((corrida) => ({
      rodada: corrida.rodada,
      posicao: corrida.classificado ? corrida.posicao : null,
      largada: corrida.largada,
      pontos: corrida.pontos + (pontosNaSprint.get(corrida.rodada) ?? 0),
    })),
  };
}

export class ConsultarDesempenho {
  constructor(private readonly fonte: FonteDoCampeonato) {}

  async executar(agora: Date): Promise<DesempenhoDaTemporada> {
    const [campeonato, participacoes] = await Promise.all([
      this.fonte.buscarCampeonato(agora),
      this.fonte.buscarParticipacoes(),
    ]);
    const porPiloto = Map.groupBy(participacoes, (participacao) => participacao.nome);
    const classificacao = new Map(campeonato.pilotos.map((piloto) => [piloto.nome, piloto]));
    const pilotos = [...porPiloto].map(([nome, dele]) => {
      const calculado = calcular(nome, dele);
      const oficial = classificacao.get(nome);

      return {
        ...calculado,
        posicao: oficial?.posicao ?? Number.POSITIVE_INFINITY,
        pontos: oficial?.pontos ?? calculado.pontos,
      };
    });
    const ordenados = pilotos.toSorted((a, b) => a.posicao - b.posicao || b.pontos - a.pontos);

    return {
      ano: campeonato.ano,
      rodadasDisputadas: campeonato.rodadasDisputadas,
      pilotos: ordenados.map((piloto, indice) => ({
        ...piloto,
        posicao: Number.isFinite(piloto.posicao) ? piloto.posicao : indice + 1,
      })),
    };
  }
}
