import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { corpoPorSecoes } from '../src/features/garagem/formas';

const CORTES = [
  { x: 0.7, largura: 0.26, base: 0.15, topo: 0.53, centroZ: 0.4 },
  { x: 0.2, largura: 0.3, base: 0.15, topo: 0.56, centroZ: 0.4 },
  { x: -0.25, largura: 0.3, base: 0.15, topo: 0.6, centroZ: 0.4 },
];

/** Quantos vértices têm a normal apontando para dentro do corpo. */
function normaisParaDentro(cortes: typeof CORTES) {
  const geometria = corpoPorSecoes(cortes).toNonIndexed();
  geometria.computeVertexNormals();
  geometria.computeBoundingBox();
  const centro = new Vector3();
  geometria.boundingBox?.getCenter(centro);
  const posicoes = geometria.getAttribute('position');
  const normais = geometria.getAttribute('normal');
  const ponto = new Vector3();
  const normal = new Vector3();
  let paraDentro = 0;

  for (let i = 0; i < posicoes.count; i++) {
    ponto.fromBufferAttribute(posicoes, i).sub(centro);
    normal.fromBufferAttribute(normais, i);
    if (ponto.dot(normal) < 0) {
      paraDentro++;
    }
  }

  return paraDentro;
}

describe('corpo do carro 3D', () => {
  it('fica do lado certo com os cortes da frente para trás', () => {
    expect(normaisParaDentro(CORTES)).toBe(0);
  });

  it('fica do lado certo com os cortes de trás para a frente', () => {
    expect(normaisParaDentro([...CORTES].reverse())).toBe(0);
  });
});
