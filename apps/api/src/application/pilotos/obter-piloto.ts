import { PilotoNaoEncontrado } from '../../domain/erros.js';
import type { Piloto } from '../../domain/piloto.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

export class ObterPiloto {
  constructor(private readonly pilotos: PilotoRepository) {}

  async executar(id: string): Promise<Piloto> {
    const piloto = await this.pilotos.buscarPorId(id);

    if (!piloto) {
      throw new PilotoNaoEncontrado();
    }

    return piloto;
  }
}
