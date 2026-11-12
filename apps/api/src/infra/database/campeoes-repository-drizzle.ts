import type { CampeoesRepository } from '../../application/ports/campeoes-repository.js';
import type { Campeao } from '../../application/ports/fonte-da-historia.js';
import type { Database } from './client.js';
import { campeoes } from './schema.js';

export class CampeoesRepositoryDrizzle implements CampeoesRepository {
  constructor(private readonly db: Database) {}

  async listar(): Promise<Campeao[]> {
    const linhas = await this.db.select().from(campeoes);

    return linhas.map(({ construtor, construtorPontos, construtorVitorias, ...campeao }) => ({
      ...campeao,
      construtor:
        construtor === null
          ? null
          : { nome: construtor, pontos: construtorPontos ?? 0, vitorias: construtorVitorias ?? 0 },
    }));
  }

  async guardar(novos: Campeao[]): Promise<void> {
    if (novos.length === 0) {
      return;
    }

    await this.db
      .insert(campeoes)
      .values(
        novos.map(({ construtor, ...campeao }) => ({
          ...campeao,
          construtor: construtor?.nome ?? null,
          construtorPontos: construtor?.pontos ?? null,
          construtorVitorias: construtor?.vitorias ?? null,
        })),
      )
      .onConflictDoNothing();
  }
}
