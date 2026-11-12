import type { DesempenhoDoPilotoDTO } from '@drs/contracts';
import { describe, expect, it } from 'vitest';
import { confronto, pontosAcumulados } from '../src/features/comparar/comparacao';

function piloto(nome: string, etapas: DesempenhoDoPilotoDTO['etapas']): DesempenhoDoPilotoDTO {
  return {
    nome,
    equipe: 'Ferrari',
    posicao: 1,
    pontos: 0,
    vitorias: 0,
    podios: 0,
    poles: 0,
    corridas: etapas.length,
    abandonos: 0,
    melhorResultado: null,
    mediaDeChegada: null,
    etapas,
  };
}

const hamilton = piloto('Lewis Hamilton', [
  { rodada: 1, posicao: 2, largada: 3, pontos: 18 },
  { rodada: 2, posicao: null, largada: 1, pontos: 0 },
  { rodada: 3, posicao: 5, largada: 0, pontos: 10 },
  { rodada: 5, posicao: 1, largada: 2, pontos: 25 },
]);

const leclerc = piloto('Charles Leclerc', [
  { rodada: 1, posicao: 4, largada: 2, pontos: 12 },
  { rodada: 2, posicao: 7, largada: 4, pontos: 6 },
  { rodada: 3, posicao: null, largada: 8, pontos: 0 },
  { rodada: 4, posicao: 1, largada: 1, pontos: 25 },
]);

describe('confronto', () => {
  it('conta quem terminou à frente só nas etapas que os dois disputaram', () => {
    expect(confronto(hamilton, leclerc).corridas).toEqual({ a: 2, b: 1 });
  });

  it('trata a largada do pit lane como a última do grid', () => {
    expect(confronto(hamilton, leclerc).largadas).toEqual({ a: 1, b: 2 });
  });

  it('não conta a etapa em que os dois abandonaram', () => {
    const a = piloto('A', [{ rodada: 1, posicao: null, largada: 1, pontos: 0 }]);
    const b = piloto('B', [{ rodada: 1, posicao: null, largada: 2, pontos: 0 }]);

    expect(confronto(a, b).corridas).toEqual({ a: 0, b: 0 });
  });
});

describe('pontosAcumulados', () => {
  it('soma etapa a etapa e mantém o total nas etapas que o piloto não correu', () => {
    expect(pontosAcumulados(hamilton, 5)).toEqual([18, 18, 28, 28, 53]);
  });
});
