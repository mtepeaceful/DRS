import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { encerrarSessao } from '../src/shared/api/sessao';
import { servidor } from './servidor';

configure({ asyncUtilTimeout: 5000 });

beforeAll(() => {
  vi.stubGlobal('scrollTo', () => {});
  Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:drs', writable: true });
  Object.defineProperty(URL, 'revokeObjectURL', { value: () => {}, writable: true });
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
