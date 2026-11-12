import { desc } from 'drizzle-orm';
import type { ImportacaoRepository } from '../../application/ports/importacao-repository.js';
import type { Database } from './client.js';
import { importacoes } from './schema.js';

export class ImportacaoRepositoryDrizzle implements ImportacaoRepository {
  constructor(private readonly db: Database) {}

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
