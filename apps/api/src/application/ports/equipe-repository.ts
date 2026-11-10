import type { DadosEquipe, Equipe } from '../../domain/equipe.js';

export interface EquipeRepository {
  listar(): Promise<Equipe[]>;
  buscarPorId(id: string): Promise<Equipe | null>;
  buscarPorNome(nome: string): Promise<Equipe | null>;
  criar(dados: DadosEquipe): Promise<Equipe>;
}
