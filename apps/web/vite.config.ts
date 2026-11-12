/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function validarUrlDaApi(valor: string | undefined) {
  if (valor === undefined || valor === '') {
    return;
  }

  let url: URL;

  try {
    url = new URL(valor);
  } catch {
    throw new Error(`VITE_API_URL precisa ser um endereço completo, mas recebeu "${valor}".`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`VITE_API_URL precisa começar com https://, mas recebeu "${valor}".`);
  }
}

export default defineConfig(({ mode }) => {
  validarUrlDaApi(loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL);

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/preparar.ts'],
      include: ['test/**/*.test.tsx'],
      restoreMocks: true,
    },
    build: {
      assetsInlineLimit: (arquivo) => (arquivo.includes('country-flag-icons') ? false : undefined),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3333',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
