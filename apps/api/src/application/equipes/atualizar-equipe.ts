import type { DadosEquipe, Equipe } from '../../domain/equipe.js';
import { EquipeJaExiste, EquipeNaoEncontrada } from '../../domain/erros.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';

export class AtualizarEquipe {
  constructor(private readonly equipes: EquipeRepository) {}

  async executar(id: string, dados: DadosEquipe): Promise<Equipe> {
    const donaDoNome = await this.equipes.buscarPorNome(dados.nome);

    if (donaDoNome && donaDoNome.id !== id) {
      throw new EquipeJaExiste(dados.nome);
    }

    const equipe = await this.equipes.atualizar(id, dados);

    if (!equipe) {
      throw new EquipeNaoEncontrada();
    }

    return equipe;
  }
}
