import {
  type Camera,
  HalfFloatType,
  type Scene,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface Efeitos {
  renderizar: () => void;
  ajustar: (largura: number, altura: number) => void;
  destruir: () => void;
}

// Oclusão de ambiente (as frestas e encaixes escurecem como numa foto),
// brilho sutil nos reflexos mais fortes e antisserrilhado por amostragem
// múltipla. Só roda em aparelhos com folga de GPU.
export function criarEfeitos(
  renderizador: WebGLRenderer,
  cena: Scene,
  camera: Camera,
  largura: number,
  altura: number,
): Efeitos {
  const alvo = new WebGLRenderTarget(largura, altura, { type: HalfFloatType, samples: 4 });
  const compositor = new EffectComposer(renderizador, alvo);
  compositor.setPixelRatio(renderizador.getPixelRatio());
  compositor.setSize(largura, altura);

  compositor.addPass(new RenderPass(cena, camera));

  const oclusao = new GTAOPass(cena, camera, largura, altura);
  oclusao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.6, thickness: 1, scale: 1 });
  oclusao.blendIntensity = 0.85;
  compositor.addPass(oclusao);

  compositor.addPass(new UnrealBloomPass(new Vector2(largura, altura), 0.15, 0.3, 2));
  compositor.addPass(new OutputPass());

  return {
    renderizar: () => compositor.render(),
    ajustar: (novaLargura, novaAltura) => compositor.setSize(novaLargura, novaAltura),
    destruir: () => {
      for (const passo of compositor.passes) {
        passo.dispose();
      }

      compositor.dispose();
    },
  };
}
