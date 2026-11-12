import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { Carreira, FonteDaHistoria } from '../ports/fonte-da-historia.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';
import { ObterPiloto } from './obter-piloto.js';

export interface CarreiraDoPiloto extends Carreira {
  titulos: number[];
}

export class ConsultarCarreira {
  private readonly obter: ObterPiloto;

  constructor(
    pilotos: PilotoRepository,
    private readonly campeoes: CampeoesRepository,
    private readonly fonte: FonteDaHistoria,
  ) {
    this.obter = new ObterPiloto(pilotos);
  }

  async executar(id: string): Promise<CarreiraDoPiloto | null> {
    const piloto = await this.obter.executar(id);
    const [carreira, campeoes] = await Promise.all([
      this.fonte.buscarCarreira(piloto.nome),
      this.campeoes.listar(),
    ]);

    if (!carreira) {
      return null;
    }

    return {
      ...carreira,
      titulos: campeoes
        .filter((campeao) => campeao.piloto === piloto.nome)
        .map((campeao) => campeao.ano)
        .toSorted((a, b) => a - b),
    };
  }
}
