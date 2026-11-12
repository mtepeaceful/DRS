import type { Repositorios } from '../app.js';
import type { ConfiguracaoDeArmazenamento } from '../env.js';
import { conectar } from './database/client.js';
import { EquipeRepositoryDrizzle } from './database/equipe-repository-drizzle.js';
import { ImportacaoRepositoryDrizzle } from './database/importacao-repository-drizzle.js';
import { PilotoRepositoryDrizzle } from './database/piloto-repository-drizzle.js';
import {
  EquipeRepositoryEmMemoria,
  ImportacaoRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from './memoria/repositorios-em-memoria.js';

export interface Armazenamento {
  repositorios: Repositorios;
  fechar: () => Promise<void>;
}

export function criarRepositorios(configuracao: ConfiguracaoDeArmazenamento): Armazenamento {
  switch (configuracao.ARMAZENAMENTO) {
    case 'postgres': {
      const { db, fechar } = conectar(configuracao.DATABASE_URL);

      return {
        repositorios: {
          pilotos: new PilotoRepositoryDrizzle(db),
          equipes: new EquipeRepositoryDrizzle(db),
          importacoes: new ImportacaoRepositoryDrizzle(db),
        },
        fechar,
      };
    }

    case 'memoria': {
      const equipes = new EquipeRepositoryEmMemoria();

      return {
        repositorios: {
          pilotos: new PilotoRepositoryEmMemoria(equipes),
          equipes,
          importacoes: new ImportacaoRepositoryEmMemoria(),
        },
        fechar: async () => {},
      };
    }
  }
}
