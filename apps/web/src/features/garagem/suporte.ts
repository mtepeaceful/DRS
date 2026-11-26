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

export function aparelhoForte() {
  const memoria = (navigator as NavegadorComMemoria).deviceMemory;
  const toque = window.matchMedia?.('(pointer: coarse)').matches ?? false;

  return !toque && (memoria === undefined || memoria >= 8) && navigator.hardwareConcurrency >= 8;
}

let porSoftware: boolean | undefined;

/**
 * Sem placa de vídeo (ou com ela bloqueada), o navegador desenha o WebGL no
 * processador (SwiftShader, llvmpipe). Cada quadro leva centenas de
 * milissegundos e compilar o 3D congela a página por segundos.
 */
export function desenhoPorSoftware() {
  if (porSoftware !== undefined) {
    return porSoftware;
  }

  porSoftware = false;

  try {
    const gl = document.createElement('canvas').getContext('webgl2');

    if (gl) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const nome: unknown = gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
      porSoftware = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(nome));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    // Sem como perguntar: segue como se houvesse placa de vídeo.
  }

  return porSoftware;
}

let primeiraInteracao: Promise<void> | undefined;

/**
 * Com placa de vídeo, o 3D começa na hora. Sem ela, só depois que a pessoa
 * mexe na página (rola, toca, move o mouse ou usa o teclado): o resto da
 * página abre sem travar e o carro aparece assim que ela começa a usar.
 */
export function quandoO3dPuderComecar(): Promise<void> {
  if (!desenhoPorSoftware()) {
    return Promise.resolve();
  }

  primeiraInteracao ??= new Promise((resolver) => {
    const sinais = ['pointerdown', 'pointermove', 'wheel', 'scroll', 'keydown', 'touchstart'];
    const aoInteragir = () => {
      for (const sinal of sinais) {
        window.removeEventListener(sinal, aoInteragir);
      }

      resolver();
    };

    for (const sinal of sinais) {
      window.addEventListener(sinal, aoInteragir, { passive: true });
    }
  });

  return primeiraInteracao;
}
