import { PilotoNaoEncontrado } from '../../domain/erros.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

export class ExcluirPiloto {
  constructor(private readonly pilotos: PilotoRepository) {}

  async executar(id: string): Promise<void> {
    if (!(await this.pilotos.excluir(id))) {
      throw new PilotoNaoEncontrado();
    }
  }
}
