import { BoxGeometry } from 'three';
import { describe, expect, it } from 'vitest';
import { desenharCarroceria } from '../src/features/equipes/carro/desenho';
import { pinturaDaEquipe } from '../src/features/equipes/carro/pinturas';
import { projetarDeLado, projetarNaPlaca } from '../src/features/garagem/lateral';
import { pinturaDoRedesenho } from '../src/features/garagem/pinturas';

const WILLIAMS = { cor: '#0a2a6b', corSecundaria: '#00a0de' };

describe('Pintura do carro 3D', () => {
  it('desenha só a carroceria, com os patrocínios e o número', () => {
    const svg = desenharCarroceria(pinturaDaEquipe('Williams', WILLIAMS), 23, 'x');

    expect(svg).toContain('KOMATSU');
    expect(svg).toContain('>23<');
    expect(svg).not.toContain('PIRELLI');
  });

  it('no lado esquerdo vira as faixas, mas mantém os textos legíveis', () => {
    const svg = desenharCarroceria(pinturaDaEquipe('Williams', WILLIAMS), 23, 'x', true);

    expect(svg).toContain('translate(1000 0) scale(-1 1)');
    expect(svg.match(/scale\(-1 1\)/g)?.length).toBeGreaterThan(2);
  });

  it('usa as cores das peças do redesenho', () => {
    const pintura = pinturaDoRedesenho('Ferrari', { cor: '#dc0000', corSecundaria: '#fff200' }, 16);

    expect(pintura.flap).toBe('#f4efe6');
    expect(pintura.direita).not.toBe(pintura.esquerda);
  });

  it('projeta o desenho de lado, cada lado do carro na sua metade da textura', () => {
    const geometria = projetarDeLado(new BoxGeometry(1, 0.5, 1).translate(0, 0.4, 0));
    const uv = geometria.getAttribute('uv');
    const normal = geometria.getAttribute('normal');

    for (let i = 0; i < uv.count; i++) {
      if (normal.getZ(i) > 0.9) expect(uv.getY(i)).toBeGreaterThanOrEqual(0.5);
      if (normal.getZ(i) < -0.9) expect(uv.getY(i)).toBeLessThanOrEqual(0.5);
    }
  });

  it('põe o patrocínio da asa na placa traseira, legível dos dois lados', () => {
    const pintura = pinturaDoRedesenho('Williams', WILLIAMS);
    expect(pintura.placaTraseira.svg).toContain('KOMATSU');

    const placa = projetarNaPlaca(new BoxGeometry(0.6, 0.7, 0.02));
    const uv = placa.getAttribute('uv');
    const normal = placa.getAttribute('normal');
    const posicao = placa.getAttribute('position');
    // Na face de fora (z > 0) o u cresce para a frente; na de dentro, ao contrário.
    for (let i = 0; i < uv.count; i++) {
      if (Math.abs(normal.getZ(i)) < 0.9) continue;
      const t = (posicao.getX(i) + 0.3) / 0.6;
      expect(uv.getX(i)).toBeCloseTo(normal.getZ(i) > 0 ? t : 1 - t);
    }
  });
});
