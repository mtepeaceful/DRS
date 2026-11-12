import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { Campeao, FonteDaHistoria } from '../ports/fonte-da-historia.js';

export const PRIMEIRA_TEMPORADA = 1950;
const ANOS_POR_LOTE = 10;

export function temporadasEncerradas(agora: Date) {
  const ultima = agora.getUTCFullYear() - 1;

  return Array.from({ length: ultima - PRIMEIRA_TEMPORADA + 1 }, (_, i) => PRIMEIRA_TEMPORADA + i);
}

export interface CampeoesGarantidos {
  campeoes: Campeao[];
  novos: number;
}

export class CampeoesDaHistoria {
  private fila: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly repositorio: CampeoesRepository,
    private readonly fonte: FonteDaHistoria,
  ) {}

  garantir(anos: number[]): Promise<CampeoesGarantidos> {
    const tarefa = this.fila.then(() => this.completar(anos));
    this.fila = tarefa.catch(() => undefined);

    return tarefa;
  }

  private async completar(anos: number[]): Promise<CampeoesGarantidos> {
    const porAno = new Map((await this.repositorio.listar()).map((c) => [c.ano, c]));
    const faltando = anos.filter((ano) => !porAno.has(ano));

    for (let inicio = 0; inicio < faltando.length; inicio += ANOS_POR_LOTE) {
      const novos = await this.fonte.buscarCampeoes(faltando.slice(inicio, inicio + ANOS_POR_LOTE));
      await this.repositorio.guardar(novos);

      for (const campeao of novos) {
        porAno.set(campeao.ano, campeao);
      }
    }

    return {
      campeoes: anos.flatMap((ano) => porAno.get(ano) ?? []),
      novos: faltando.length,
    };
  }
}
