import type { Equipe } from '../../domain/equipe.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';

export class ListarEquipes {
  constructor(private readonly equipes: EquipeRepository) {}

  executar(): Promise<Equipe[]> {
    return this.equipes.listar();
  }
}
