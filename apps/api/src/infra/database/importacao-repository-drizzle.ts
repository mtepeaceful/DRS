import { desc } from 'drizzle-orm';
import type { Campeao } from '../../application/ports/fonte-de-dados-da-f1.js';
import type { ImportacaoRepository } from '../../application/ports/importacao-repository.js';
import type { Database } from './client.js';
import { campeoes, importacoes } from './schema.js';

export class ImportacaoRepositoryDrizzle implements ImportacaoRepository {
  constructor(private readonly db: Database) {}

  listarCampeoes(): Promise<Campeao[]> {
    return this.db.select().from(campeoes);
  }

  async guardarCampeoes(novos: Campeao[]): Promise<void> {
    if (novos.length > 0) {
      await this.db.insert(campeoes).values(novos).onConflictDoNothing();
    }
  }

  async ultimaImportacao(): Promise<Date | null> {
    const [ultima] = await this.db
      .select({ executadaEm: importacoes.executadaEm })
      .from(importacoes)
      .orderBy(desc(importacoes.executadaEm))
      .limit(1);

    return ultima?.executadaEm ?? null;
  }

  async registrarImportacao(executadaEm: Date): Promise<void> {
    await this.db.insert(importacoes).values({ executadaEm });
  }
}
