import { defineConfig, devices } from '@playwright/test';
import { gerarHashDaSenha } from '../api/src/infra/seguranca/senha.js';
import { SENHA_DO_ADMINISTRADOR } from './e2e/credenciais.js';

const API = 'http://127.0.0.1:3334';
const SITE = 'http://127.0.0.1:5174';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: SITE,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    {
      name: 'celular',
      testMatch: 'visitante.spec.ts',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  webServer: [
    {
      command: 'node --import tsx src/server.ts',
      cwd: '../api',
      url: `${API}/health`,
      reuseExistingServer: false,
      env: {
        PORT: '3334',
        HOST: '127.0.0.1',
        LOG_LEVEL: 'warn',
        ARMAZENAMENTO: 'memoria',
        TAREFAS_EM_SEGUNDO_PLANO: 'false',
        ORIGENS_PERMITIDAS: SITE,
        ADMIN_SENHA_HASH: await gerarHashDaSenha(SENHA_DO_ADMINISTRADOR),
        SEGREDO_DA_SESSAO: 'segredo-dos-testes-de-ponta-a-ponta-com-folga',
      },
    },
    {
      command: 'vite build && vite preview --host 127.0.0.1 --port 5174 --strictPort',
      url: SITE,
      reuseExistingServer: false,
      env: { VITE_API_URL: API },
    },
  ],
});
