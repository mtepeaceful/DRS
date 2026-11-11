import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { encerrarSessao } from '../src/shared/api/sessao';
import { servidor } from './servidor';

beforeAll(() => {
  vi.stubGlobal('scrollTo', () => {});
  servidor.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  servidor.resetHandlers();
  encerrarSessao();
});

afterAll(() => servidor.close());
