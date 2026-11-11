import { asc, eq, sql } from 'drizzle-orm';
import type { EquipeRepository } from '../../application/ports/equipe-repository.js';
import type { DadosEquipe, Equipe } from '../../domain/equipe.js';
import { EquipeJaExiste } from '../../domain/erros.js';
import type { Database } from './client.js';
import { violouUnicidade } from './erros-postgres.js';
import { equipes } from './schema.js';

export const colunasDaEquipe = {
  id: equipes.id,
  nome: equipes.nome,
  cor: equipes.cor,
  corSecundaria: equipes.corSecundaria,
};

export class EquipeRepositoryDrizzle implements EquipeRepository {
  constructor(private readonly db: Database) {}

  listar(): Promise<Equipe[]> {
    return this.db.select(colunasDaEquipe).from(equipes).orderBy(asc(equipes.nome));
  }

  async buscarPorId(id: string): Promise<Equipe | null> {
    const [equipe] = await this.db.select(colunasDaEquipe).from(equipes).where(eq(equipes.id, id));

    return equipe ?? null;
  }

  async buscarPorNome(nome: string): Promise<Equipe | null> {
    const [equipe] = await this.db
      .select(colunasDaEquipe)
      .from(equipes)
      .where(eq(sql`lower(${equipes.nome})`, nome.toLowerCase()));

    return equipe ?? null;
  }

  async criar(dados: DadosEquipe): Promise<Equipe> {
    const [equipe] = await this.gravar(dados, () =>
      this.db.insert(equipes).values(dados).returning(colunasDaEquipe),
    );

    if (!equipe) {
      throw new Error('O banco não retornou a equipe criada');
    }

    return equipe;
  }

  async atualizar(id: string, dados: DadosEquipe): Promise<Equipe | null> {
    const [equipe] = await this.gravar(dados, () =>
      this.db.update(equipes).set(dados).where(eq(equipes.id, id)).returning(colunasDaEquipe),
    );

    return equipe ?? null;
  }

  private async gravar<Resultado>(dados: DadosEquipe, operacao: () => Promise<Resultado>) {
    try {
      return await operacao();
    } catch (erro) {
      throw violouUnicidade(erro, 'equipes_nome_unico') ? new EquipeJaExiste(dados.nome) : erro;
    }
  }
}
