import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/**/*.test.ts'],
          exclude: ['test/integracao/**'],
        },
      },
      {
        test: {
          name: 'integracao',
          include: ['test/integracao/**/*.test.ts'],
          globalSetup: ['test/integracao/preparar-banco.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
});
