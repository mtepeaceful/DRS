import type { DadosEquipe, Equipe } from '../../domain/equipe.js';
import { EquipeJaExiste } from '../../domain/erros.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';

export class CadastrarEquipe {
  constructor(private readonly equipes: EquipeRepository) {}

  async executar(dados: DadosEquipe): Promise<Equipe> {
    if (await this.equipes.buscarPorNome(dados.nome)) {
      throw new EquipeJaExiste(dados.nome);
    }

    return this.equipes.criar(dados);
  }
}
