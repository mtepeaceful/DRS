import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export function conectar(url: string) {
  const pool = new pg.Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  return { db, fechar: () => pool.end() };
}

export type Database = ReturnType<typeof conectar>['db'];
