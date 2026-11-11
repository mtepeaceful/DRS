import { buildApp } from './app.js';
import { loadEnv } from './env.js';
import { criarRepositorios } from './infra/criar-repositorios.js';

const env = loadEnv();
const { repositorios, fechar } = criarRepositorios(env);
const app = await buildApp(
  repositorios,
  {
    autenticacao: { hashDaSenha: env.ADMIN_SENHA_HASH, segredo: env.SEGREDO_DA_SESSAO },
    origensPermitidas: env.ORIGENS_PERMITIDAS,
  },
  { logger: { level: env.LOG_LEVEL }, trustProxy: true },
);

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
