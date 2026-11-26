import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { encerrarSessao } from '../src/shared/api/sessao';
import { trocarIdioma } from '../src/shared/i18n/idioma';
import { servidor } from './servidor';

configure({ asyncUtilTimeout: 10_000 });
trocarIdioma('pt');

beforeAll(() => {
  vi.stubGlobal('scrollTo', () => {});
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: () => {}, writable: true });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    value(this: HTMLDialogElement) {
      this.open = true;
    },
    writable: true,
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    value(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
    writable: true,
  });
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
  trocarIdioma('pt');
});

afterAll(() => servidor.close());
