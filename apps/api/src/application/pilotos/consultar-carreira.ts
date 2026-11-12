import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { FonteDaHistoria } from '../ports/fonte-da-historia.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';
import { nomeComparavel } from './nome-comparavel.js';
import { ObterPiloto } from './obter-piloto.js';

export interface CarreiraDoPiloto {
  nascimento: string | null;
  estreia: number;
  temporadas: number;
  corridas: number;
  vitorias: number;
  podios: number;
  poles: number;
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
    const chave = nomeComparavel(piloto.nome);
    const naF1 = (await this.fonte.listarPilotos()).find(
      (candidato) => nomeComparavel(candidato.nome) === chave,
    );

    if (!naF1) {
      return null;
    }

    const [carreira, campeoes] = await Promise.all([
      this.fonte.buscarCarreira(naF1.id),
      this.campeoes.listar(),
    ]);

    return {
      nascimento: naF1.nascimento,
      estreia: Math.min(...carreira.temporadas),
      temporadas: carreira.temporadas.length,
      corridas: carreira.corridas,
      vitorias: carreira.vitorias,
      podios: carreira.podios,
      poles: carreira.poles,
      titulos: campeoes
        .filter((campeao) => nomeComparavel(campeao.piloto) === chave)
        .map((campeao) => campeao.ano)
        .toSorted((a, b) => a - b),
    };
  }
}
