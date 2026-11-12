import { describe, expect, it } from 'vitest';
import { ConsultarDesempenho } from '../../src/application/desempenho/consultar-desempenho.js';
import type {
  Campeonato,
  FonteDoCampeonato,
  Participacao,
} from '../../src/application/ports/fonte-do-campeonato.js';

function participacao(
  nome: string,
  rodada: number,
  posicao: number,
  extra: Partial<Participacao> = {},
): Participacao {
  return {
    rodada,
    tipo: 'corrida',
    nome,
    equipe: 'McLaren',
    posicao,
    classificado: true,
    largada: posicao,
    pontos: [25, 18, 15, 12][posicao - 1] ?? 0,
    ...extra,
  };
}

const participacoes: Participacao[] = [
  participacao('Lando Norris', 1, 1),
  participacao('Lando Norris', 2, 3, { largada: 1 }),
  participacao('Lando Norris', 3, 18, { classificado: false, pontos: 0 }),
  participacao('Lando Norris', 2, 2, { tipo: 'sprint', pontos: 7 }),
  participacao('Oscar Piastri', 1, 2),
  participacao('Oscar Piastri', 2, 1, { largada: 4 }),
  participacao('Oscar Piastri', 3, 4),
  participacao('Piloto Reserva', 3, 15, { equipe: 'Haas F1 Team', pontos: 0 }),
];

const campeonato: Campeonato = {
  ano: 2026,
  totalDeRodadas: 23,
  rodadasDisputadas: 3,
  proximaCorrida: null,
  ultimaCorrida: null,
  construtores: [],
  pilotos: [
    { posicao: 1, nome: 'Oscar Piastri', equipe: 'McLaren', pontos: 55, vitorias: 1 },
    { posicao: 2, nome: 'Lando Norris', equipe: 'McLaren', pontos: 47, vitorias: 1 },
  ],
};

function fonte(): FonteDoCampeonato {
  return {
    buscarCampeonato: async () => campeonato,
    buscarCalendario: async () => [],
    buscarResultado: async () => null,
    buscarParticipacoes: async () => participacoes,
  };
}

describe('ConsultarDesempenho', () => {
  it('resume a temporada de cada piloto', async () => {
    const { pilotos } = await new ConsultarDesempenho(fonte()).executar(new Date());
    const norris = pilotos.find((piloto) => piloto.nome === 'Lando Norris');

    expect(norris).toMatchObject({
      posicao: 2,
      pontos: 47,
      vitorias: 1,
      podios: 2,
      poles: 2,
      corridas: 3,
      abandonos: 1,
      melhorResultado: 1,
      mediaDeChegada: 2,
    });
  });

  it('soma os pontos da sprint na etapa em que ela aconteceu', async () => {
    const { pilotos } = await new ConsultarDesempenho(fonte()).executar(new Date());

    expect(pilotos.find((piloto) => piloto.nome === 'Lando Norris')?.etapas).toEqual([
      { rodada: 1, posicao: 1, largada: 1, pontos: 25 },
      { rodada: 2, posicao: 3, largada: 1, pontos: 22 },
      { rodada: 3, posicao: null, largada: 18, pontos: 0 },
    ]);
  });

  it('segue a ordem do campeonato e põe quem não pontuou no fim', async () => {
    const resultado = await new ConsultarDesempenho(fonte()).executar(new Date());

    expect(resultado.ano).toBe(2026);
    expect(resultado.pilotos.map((piloto) => [piloto.posicao, piloto.nome])).toEqual([
      [1, 'Oscar Piastri'],
      [2, 'Lando Norris'],
      [3, 'Piloto Reserva'],
    ]);
  });
});
