import { buildApp } from './app.js';
import { loadEnv } from './env.js';
import { conectar } from './infra/database/client.js';
import { EquipeRepositoryDrizzle } from './infra/database/equipe-repository-drizzle.js';
import { PilotoRepositoryDrizzle } from './infra/database/piloto-repository-drizzle.js';

const env = loadEnv();
const { db, fechar } = conectar(env.DATABASE_URL);
const app = await buildApp(
  { pilotos: new PilotoRepositoryDrizzle(db), equipes: new EquipeRepositoryDrizzle(db) },
  { logger: { level: env.LOG_LEVEL } },
);

app.addHook('onClose', fechar);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.fatal(error);
  await fechar();
  process.exit(1);
}
