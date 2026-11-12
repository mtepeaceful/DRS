import { CircuitoNaoEncontrado } from '../../domain/erros.js';
import type { Enciclopedia, Verbete } from '../ports/fonte-das-equipes.js';
import type {
  Circuito,
  FonteDosCircuitos,
  VitoriaNoCircuito,
} from '../ports/fonte-dos-circuitos.js';
import type { FonteDoCampeonato } from '../ports/fonte-do-campeonato.js';

const TAMANHO_DO_RANKING = 5;

export interface ResumoDoCircuito extends Circuito {
  noCalendarioAtual: boolean;
}

export interface Maior {
  nome: string;
  vitorias: number;
}

export interface FichaDoCircuito extends ResumoDoCircuito {
  vitorias: VitoriaNoCircuito[];
  maioresPilotos: Maior[];
  maioresEquipes: Maior[];
  verbete: Verbete | null;
  proximaCorrida: { rodada: number; nome: string; inicio: Date } | null;
}

function ranking(vitorias: VitoriaNoCircuito[], dono: (vitoria: VitoriaNoCircuito) => string) {
  const contagem = new Map<string, number>();

  for (const vitoria of vitorias) {
    contagem.set(dono(vitoria), (contagem.get(dono(vitoria)) ?? 0) + 1);
  }

  return [...contagem]
    .map(([nome, total]) => ({ nome, vitorias: total }))
    .filter((maior) => maior.vitorias > 1)
    .toSorted((a, b) => b.vitorias - a.vitorias || a.nome.localeCompare(b.nome))
    .slice(0, TAMANHO_DO_RANKING);
}

export class ConsultarCircuitos {
  constructor(
    private readonly circuitos: FonteDosCircuitos,
    private readonly enciclopedia: Enciclopedia,
    private readonly campeonato: FonteDoCampeonato,
  ) {}

  async listar(): Promise<ResumoDoCircuito[]> {
    const [circuitos, noCalendario] = await Promise.all([
      this.circuitos.listar(),
      this.idsNoCalendario(),
    ]);

    return circuitos
      .map((circuito) => ({ ...circuito, noCalendarioAtual: noCalendario.has(circuito.id) }))
      .toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async detalhar(id: string, agora: Date): Promise<FichaDoCircuito> {
    const circuito = (await this.circuitos.listar()).find((candidato) => candidato.id === id);

    if (!circuito) {
      throw new CircuitoNaoEncontrado();
    }

    const [vitorias, verbete, calendario] = await Promise.all([
      this.circuitos.vencedores(id),
      circuito.wikipedia
        ? this.enciclopedia.verbete(circuito.wikipedia).catch(() => null)
        : Promise.resolve(null),
      this.campeonato.buscarCalendario().catch(() => []),
    ]);
    const proxima = calendario.find(
      (etapa) => etapa.circuitoId === id && !etapa.vencedor && etapa.inicio > agora,
    );

    return {
      ...circuito,
      noCalendarioAtual: calendario.some((etapa) => etapa.circuitoId === id),
      vitorias: vitorias.toSorted((a, b) => b.ano - a.ano || b.rodada - a.rodada),
      maioresPilotos: ranking(vitorias, (vitoria) => vitoria.piloto),
      maioresEquipes: ranking(vitorias, (vitoria) => vitoria.equipe),
      verbete,
      proximaCorrida: proxima
        ? { rodada: proxima.rodada, nome: proxima.nome, inicio: proxima.inicio }
        : null,
    };
  }

  private async idsNoCalendario() {
    const calendario = await this.campeonato.buscarCalendario().catch(() => []);

    return new Set(calendario.map((etapa) => etapa.circuitoId));
  }
}
