import { EquipeNaoEncontrada, NumeroJaEmUso, PilotoNaoEncontrado } from '../../domain/erros.js';
import type { DadosPiloto, Piloto } from '../../domain/piloto.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

export class AtualizarPiloto {
  constructor(
    private readonly pilotos: PilotoRepository,
    private readonly equipes: EquipeRepository,
  ) {}

  async executar(id: string, dados: DadosPiloto): Promise<Piloto> {
    if (!(await this.equipes.buscarPorId(dados.equipeId))) {
      throw new EquipeNaoEncontrada();
    }

    const donoDoNumero = await this.pilotos.buscarPorNumero(dados.numero);

    if (donoDoNumero && donoDoNumero.id !== id) {
      throw new NumeroJaEmUso(dados.numero);
    }

    const piloto = await this.pilotos.atualizar(id, dados);

    if (!piloto) {
      throw new PilotoNaoEncontrado();
    }

    return piloto;
  }
}
