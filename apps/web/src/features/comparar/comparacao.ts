import type { DesempenhoDoPilotoDTO } from '@drs/contracts';

type Etapas = DesempenhoDoPilotoDTO['etapas'];

export interface Placar {
  a: number;
  b: number;
}

function placar(
  etapasA: Etapas,
  etapasB: Etapas,
  posicao: (etapa: Etapas[number]) => number | null,
): Placar {
  const deB = new Map(etapasB.map((etapa) => [etapa.rodada, etapa]));
  const resultado = { a: 0, b: 0 };

  for (const etapaA of etapasA) {
    const etapaB = deB.get(etapaA.rodada);

    if (!etapaB) {
      continue;
    }

    const pa = posicao(etapaA) ?? Number.POSITIVE_INFINITY;
    const pb = posicao(etapaB) ?? Number.POSITIVE_INFINITY;

    if (pa < pb) resultado.a++;
    if (pb < pa) resultado.b++;
  }

  return resultado;
}

export function confronto(a: DesempenhoDoPilotoDTO, b: DesempenhoDoPilotoDTO) {
  return {
    corridas: placar(a.etapas, b.etapas, (etapa) => etapa.posicao),
    largadas: placar(a.etapas, b.etapas, (etapa) => (etapa.largada > 0 ? etapa.largada : null)),
  };
}

export function pontosAcumulados(piloto: DesempenhoDoPilotoDTO, rodadas: number) {
  const porRodada = new Map(piloto.etapas.map((etapa) => [etapa.rodada, etapa.pontos]));
  let soma = 0;

  return Array.from({ length: rodadas }, (_, indice) => {
    soma += porRodada.get(indice + 1) ?? 0;

    return soma;
  });
}
