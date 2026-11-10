import { loadEnv } from '../env.js';
import { migrar } from '../infra/database/migrar.js';

await migrar(loadEnv().DATABASE_URL);
