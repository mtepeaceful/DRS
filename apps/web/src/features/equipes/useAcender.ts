import { type RefObject, useEffect, useState } from 'react';

/** A faixa do meio da tela: o cartão acende ao passar por ela. */
const FAIXA_DO_MEIO = '-42% 0px -42% 0px';

/**
 * Sem mouse não há hover. Nas telas de toque, o cartão acende sozinho quando
 * passa pelo meio da tela e apaga quando sai.
 */
export function useAcenderNaTela(ref: RefObject<HTMLElement | null>) {
  const [naTela, setNaTela] = useState(false);

  useEffect(() => {
    const elemento = ref.current;

    if (
      !elemento ||
      typeof IntersectionObserver === 'undefined' ||
      typeof matchMedia === 'undefined' ||
      !matchMedia('(hover: none)').matches
    ) {
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => setNaTela(entrada?.isIntersecting ?? false),
      { rootMargin: FAIXA_DO_MEIO },
    );
    observador.observe(elemento);

    return () => observador.disconnect();
  }, [ref]);

  return naTela;
}
