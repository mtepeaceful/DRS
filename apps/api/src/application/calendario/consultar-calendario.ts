import { EtapaNaoEncontrada } from '../../domain/erros.js';
import type { Etapa, FonteDoCampeonato, ResultadoDaEtapa } from '../ports/fonte-do-campeonato.js';

export class ConsultarCalendario {
  constructor(private readonly fonte: FonteDoCampeonato) {}

  listar(): Promise<Etapa[]> {
    return this.fonte.buscarCalendario();
  }

  async resultado(rodada: number): Promise<ResultadoDaEtapa> {
    const resultado = await this.fonte.buscarResultado(rodada);

    if (!resultado) {
      throw new EtapaNaoEncontrada();
    }

    return resultado;
  }
}
