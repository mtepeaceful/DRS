import { describe, expect, it } from 'vitest';
import { desenharCarroceria } from '../src/features/equipes/carro/desenho';
import { pinturaDaEquipe } from '../src/features/equipes/carro/pinturas';
import { pinturaDoRedesenho } from '../src/features/garagem/pinturas';

const WILLIAMS = { cor: '#0a2a6b', corSecundaria: '#00a0de' };

describe('Pintura do redesenho para os modelos 3D', () => {
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

  it('põe o patrocínio da asa na placa traseira', () => {
    const pintura = pinturaDoRedesenho('Williams', WILLIAMS);
    expect(pintura.placaTraseira.svg).toContain('KOMATSU');
  });

  it('repete o patrocinador principal no sidepod e na asa dianteira e põe outro no bico', () => {
    const pintura = pinturaDoRedesenho('Williams', WILLIAMS);

    expect(pintura.topoDoSidepod?.svg).toContain('ATLASSIAN');
    expect(pintura.placaDianteira?.svg).toContain('ATLASSIAN');
    expect(pintura.bico?.svg).toContain('KOMATSU');
  });
});
