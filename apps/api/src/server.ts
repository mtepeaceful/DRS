import { buildApp } from './app.js';
import { loadEnv } from './env.js';
import { criarRepositorios } from './infra/criar-repositorios.js';

const env = loadEnv();
const { repositorios, fechar } = criarRepositorios(env);
const app = await buildApp(repositorios, { logger: { level: env.LOG_LEVEL } });

app.addHook('onClose', fechar);

if (env.ARMAZENAMENTO === 'memoria') {
  app.log.warn('Modo demonstração: os dados ficam só na memória e somem ao reiniciar a API.');
}

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
