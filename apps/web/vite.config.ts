import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
});
