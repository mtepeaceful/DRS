import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { conectar } from './client.js';

const pastaDeMigracoes = fileURLToPath(new URL('../../../drizzle', import.meta.url));

export async function migrar(url: string) {
  const { db, fechar } = conectar(url);

  try {
    await migrate(db, { migrationsFolder: pastaDeMigracoes });
  } finally {
    await fechar();
  }
}
