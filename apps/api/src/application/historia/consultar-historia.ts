import { TemporadaNaoEncontrada } from '../../domain/erros.js';
import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { Campeao, FonteDaHistoria, TemporadaHistorica } from '../ports/fonte-da-historia.js';
import { temporadasEncerradas } from './campeoes-da-historia.js';

const TAMANHO_DO_RANKING = 5;

export interface Recordista {
  nome: string;
  pais: string | null;
  titulos: number;
  anos: number[];
}

export interface HistoriaDosCampeoes {
  temporadas: Campeao[];
  faltando: number;
  maioresPilotos: Recordista[];
  maioresConstrutores: Recordista[];
}

type Dono = Pick<Recordista, 'nome' | 'pais'> | null;

function ranking(campeoes: Campeao[], dono: (campeao: Campeao) => Dono) {
  const porNome = new Map<string, Recordista>();

  for (const campeao of campeoes.toSorted((a, b) => a.ano - b.ano)) {
    const titular = dono(campeao);

    if (!titular) {
      continue;
    }

    const atual = porNome.get(titular.nome) ?? { ...titular, titulos: 0, anos: [] };
    atual.titulos++;
    atual.anos.push(campeao.ano);
    porNome.set(titular.nome, atual);
  }

  return [...porNome.values()]
    .toSorted((a, b) => b.titulos - a.titulos || (a.anos[0] ?? 0) - (b.anos[0] ?? 0))
    .slice(0, TAMANHO_DO_RANKING);
}

export class ConsultarHistoria {
  constructor(
    private readonly campeoes: CampeoesRepository,
    private readonly fonte: FonteDaHistoria,
  ) {}

  async listarCampeoes(agora: Date): Promise<HistoriaDosCampeoes> {
    const anos = new Set(temporadasEncerradas(agora));
    const temporadas = (await this.campeoes.listar())
      .filter((campeao) => anos.has(campeao.ano))
      .toSorted((a, b) => b.ano - a.ano);

    return {
      temporadas,
      faltando: anos.size - temporadas.length,
      maioresPilotos: ranking(temporadas, ({ piloto, pais }) => ({ nome: piloto, pais })),
      maioresConstrutores: ranking(temporadas, ({ construtor }) =>
        construtor ? { nome: construtor.nome, pais: null } : null,
      ),
    };
  }

  temporada(ano: number, agora: Date): Promise<TemporadaHistorica> {
    if (!temporadasEncerradas(agora).includes(ano)) {
      throw new TemporadaNaoEncontrada();
    }

    return this.fonte.buscarTemporada(ano);
  }
}
