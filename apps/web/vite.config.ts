/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const DESCRICAO =
  'Data Retrieval System da Fórmula 1: temporada atual, resultados, comparação de pilotos e a história desde 1950.';

function tagsDePrevia(urlDoSite: string | undefined): Plugin {
  const tags = [
    ['og:type', 'website'],
    ['og:site_name', 'DRS'],
    ['og:title', 'DRS · Data Retrieval System'],
    ['og:description', DESCRICAO],
    ['og:locale', 'pt_BR'],
    ...(urlDoSite
      ? [
          ['og:url', urlDoSite],
          ['og:image', new URL('/og.png', urlDoSite).href],
          ['og:image:width', '1200'],
          ['og:image:height', '630'],
        ]
      : []),
  ];

  return {
    name: 'tags-de-previa',
    transformIndexHtml: () => [
      ...tags.map(([property, content]) => ({
        tag: 'meta',
        attrs: { property, content },
        injectTo: 'head' as const,
      })),
      {
        tag: 'meta',
        attrs: { name: 'twitter:card', content: 'summary_large_image' },
        injectTo: 'head' as const,
      },
    ],
  };
}

function validarUrl(nome: string, valor: string | undefined) {
  if (valor === undefined || valor === '') {
    return;
  }

  let url: URL;

  try {
    url = new URL(valor);
  } catch {
    throw new Error(`${nome} precisa ser um endereço completo, mas recebeu "${valor}".`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${nome} precisa começar com https://, mas recebeu "${valor}".`);
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  validarUrl('VITE_API_URL', env.VITE_API_URL);
  validarUrl('VITE_SITE_URL', env.VITE_SITE_URL);

  return {
    plugins: [react(), tagsDePrevia(env.VITE_SITE_URL || undefined)],
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/preparar.ts'],
      include: ['test/**/*.test.{ts,tsx}'],
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
