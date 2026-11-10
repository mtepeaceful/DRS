import { EquipeNaoEncontrada, NumeroJaEmUso } from '../../domain/erros.js';
import type { DadosPiloto, Piloto } from '../../domain/piloto.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

export class CadastrarPiloto {
  constructor(
    private readonly pilotos: PilotoRepository,
    private readonly equipes: EquipeRepository,
  ) {}

  async executar(dados: DadosPiloto): Promise<Piloto> {
    if (!(await this.equipes.buscarPorId(dados.equipeId))) {
      throw new EquipeNaoEncontrada();
    }

    if (await this.pilotos.buscarPorNumero(dados.numero)) {
      throw new NumeroJaEmUso(dados.numero);
    }

    return this.pilotos.criar(dados);
  }
}
