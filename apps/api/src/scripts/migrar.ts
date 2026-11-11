import { loadEnv } from '../env.js';
import { migrar } from '../infra/database/migrar.js';

const env = loadEnv();

if (env.ARMAZENAMENTO !== 'postgres') {
  throw new Error('As migrations só se aplicam ao armazenamento postgres.');
}

await migrar(env.DATABASE_URL);
