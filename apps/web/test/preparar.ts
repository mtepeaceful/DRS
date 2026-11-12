import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { encerrarSessao } from '../src/shared/api/sessao';
import { servidor } from './servidor';

beforeAll(() => {
  vi.stubGlobal('scrollTo', () => {});
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly avisar: ResizeObserverCallback) {}

      observe() {
        this.avisar(
          [{ contentRect: { width: 640 } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      }

      disconnect() {}
    },
  );
  servidor.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  servidor.resetHandlers();
  encerrarSessao();
});

afterAll(() => servidor.close());
