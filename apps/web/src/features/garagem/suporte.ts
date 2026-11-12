interface NavegadorComMemoria extends Navigator {
  deviceMemory?: number;
}

export function temWebgl() {
  try {
    const tela = document.createElement('canvas');

    return Boolean(tela.getContext('webgl2') ?? tela.getContext('webgl'));
  } catch {
    return false;
  }
}

export function preferePoucoMovimento() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function aparelhoModesto() {
  const memoria = (navigator as NavegadorComMemoria).deviceMemory;

  return (memoria !== undefined && memoria <= 2) || navigator.hardwareConcurrency <= 2;
}
