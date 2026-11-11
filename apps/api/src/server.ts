import { buildApp } from './app.js';
import { loadEnv } from './env.js';
import { criarRepositorios } from './infra/criar-repositorios.js';
import { comCache, comCachePorChave } from './infra/cache/com-cache.js';
import { FonteCampeonatoJolpica } from './infra/f1/fonte-campeonato-jolpica.js';
import { FonteJolpicaOpenF1 } from './infra/f1/fonte-jolpica-openf1.js';
import { FonteRssMotorsport } from './infra/noticias/fonte-rss-motorsport.js';

const env = loadEnv();
const MINUTO = 60_000;
const campeonato = new FonteCampeonatoJolpica();
const noticias = new FonteRssMotorsport();
const campeonatoEmCache = comCache(() => campeonato.buscarCampeonato(new Date()), 30 * MINUTO);
const noticiasEmCache = comCache(() => noticias.buscarNoticias(), 15 * MINUTO);
const calendarioEmCache = comCache(() => campeonato.buscarCalendario(), 30 * MINUTO);
const resultadoEmCache = comCachePorChave(
  (rodada: number) => campeonato.buscarResultado(rodada),
  30 * MINUTO,
);
const { repositorios, fechar } = criarRepositorios(env);
const app = await buildApp(
  repositorios,
  {
    autenticacao: { hashDaSenha: env.ADMIN_SENHA_HASH, segredo: env.SEGREDO_DA_SESSAO },
    fonteDeDados: new FonteJolpicaOpenF1(),
    campeonato: {
      buscarCampeonato: campeonatoEmCache,
      buscarCalendario: calendarioEmCache,
      buscarResultado: resultadoEmCache,
    },
    noticias: { buscarNoticias: noticiasEmCache },
    origensPermitidas: env.ORIGENS_PERMITIDAS,
    atualizarGridSozinho: env.ATUALIZAR_GRID_SOZINHO,
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
