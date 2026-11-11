import { existsSync } from 'node:fs';
import type { TestProject } from 'vitest/node';
import { migrar } from '../../src/infra/database/migrar.js';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export default async function prepararBanco(project: TestProject) {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const url = process.env.DATABASE_URL_TEST;

  if (!url) {
    throw new Error('Defina DATABASE_URL_TEST no apps/api/.env para rodar os testes de integração');
  }

  await migrar(url);
  project.provide('databaseUrl', url);
}
