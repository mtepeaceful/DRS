import { asc, eq, sql } from 'drizzle-orm';
import type { EquipeRepository } from '../../application/ports/equipe-repository.js';
import type { DadosEquipe, Equipe } from '../../domain/equipe.js';
import { EquipeJaExiste } from '../../domain/erros.js';
import type { Database } from './client.js';
import { violouUnicidade } from './erros-postgres.js';
import { equipes } from './schema.js';

const colunas = { id: equipes.id, nome: equipes.nome };

export class EquipeRepositoryDrizzle implements EquipeRepository {
  constructor(private readonly db: Database) {}

  listar(): Promise<Equipe[]> {
    return this.db.select(colunas).from(equipes).orderBy(asc(equipes.nome));
  }

  async buscarPorId(id: string): Promise<Equipe | null> {
    const [equipe] = await this.db.select(colunas).from(equipes).where(eq(equipes.id, id));

    return equipe ?? null;
  }

  async buscarPorNome(nome: string): Promise<Equipe | null> {
    const [equipe] = await this.db
      .select(colunas)
      .from(equipes)
      .where(eq(sql`lower(${equipes.nome})`, nome.toLowerCase()));

    return equipe ?? null;
  }

  async criar(dados: DadosEquipe): Promise<Equipe> {
    const [equipe] = await this.db
      .insert(equipes)
      .values(dados)
      .returning(colunas)
      .catch((erro: unknown) => {
        throw violouUnicidade(erro, 'equipes_nome_unico') ? new EquipeJaExiste(dados.nome) : erro;
      });

    if (!equipe) {
      throw new Error('O banco não retornou a equipe criada');
    }

    return equipe;
  }
}
