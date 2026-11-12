import { describe, expect, it } from 'vitest';
import { ConsultarCircuitos } from '../../src/application/circuitos/consultar-circuitos.js';
import type {
  Circuito,
  VitoriaNoCircuito,
} from '../../src/application/ports/fonte-dos-circuitos.js';
import type { Etapa, FonteDoCampeonato } from '../../src/application/ports/fonte-do-campeonato.js';
import { CircuitoNaoEncontrado } from '../../src/domain/erros.js';

const AGORA = new Date('2026-08-01T12:00:00Z');

function circuito(id: string, nome: string): Circuito {
  return { id, nome, cidade: 'Cidade', pais: 'Italy', latitude: 45, longitude: 9, wikipedia: nome };
}

function vitoria(ano: number, piloto: string, equipe: string): VitoriaNoCircuito {
  return { ano, rodada: 14, gp: 'Italian Grand Prix', piloto, equipe };
}

function etapa(
  rodada: number,
  circuitoId: string,
  inicio: string,
  vencedor: Etapa['vencedor'],
): Etapa {
  return {
    rodada,
    nome: `GP ${rodada}`,
    circuito: circuitoId,
    circuitoId,
    cidade: 'Cidade',
    pais: 'Italy',
    inicio: new Date(inicio),
    sessoes: [],
    vencedor,
  };
}

function criar(verbete = async () => null) {
  const campeonato: FonteDoCampeonato = {
    buscarCampeonato: () => Promise.reject(new Error('não usado')),
    buscarCalendario: async () => [
      etapa(1, 'albert_park', '2026-03-08T04:00:00Z', { nome: 'X', equipe: 'Y' }),
      etapa(14, 'monza', '2026-09-06T13:00:00Z', null),
    ],
    buscarResultado: async () => null,
    buscarParticipacoes: async () => [],
  };

  return new ConsultarCircuitos(
    {
      listar: async () => [
        circuito('monza', 'Monza'),
        circuito('imola', 'Imola'),
        circuito('albert_park', 'Albert Park'),
      ],
      vencedores: async () => [
        vitoria(1950, 'Nino Farina', 'Alfa Romeo'),
        vitoria(2019, 'Charles Leclerc', 'Ferrari'),
        vitoria(2000, 'Michael Schumacher', 'Ferrari'),
        vitoria(1998, 'Michael Schumacher', 'Ferrari'),
        vitoria(2003, 'Michael Schumacher', 'Ferrari'),
      ],
    },
    { verbete },
    campeonato,
  );
}

describe('ConsultarCircuitos', () => {
  it('lista em ordem alfabética marcando os circuitos do calendário atual', async () => {
    const lista = await criar().listar();

    expect(lista.map((c) => [c.nome, c.noCalendarioAtual])).toEqual([
      ['Albert Park', true],
      ['Imola', false],
      ['Monza', true],
    ]);
  });

  it('monta a ficha com vencedores do mais recente ao mais antigo e os maiores vencedores', async () => {
    const ficha = await criar().detalhar('monza', AGORA);

    expect(ficha.vitorias.map((v) => v.ano)).toEqual([2019, 2003, 2000, 1998, 1950]);
    expect(ficha.maioresPilotos).toEqual([{ nome: 'Michael Schumacher', vitorias: 3 }]);
    expect(ficha.maioresEquipes).toEqual([{ nome: 'Ferrari', vitorias: 4 }]);
    expect(ficha.proximaCorrida).toEqual({
      rodada: 14,
      nome: 'GP 14',
      inicio: new Date('2026-09-06T13:00:00Z'),
    });
  });

  it('segue sem o verbete quando a enciclopédia está fora do ar', async () => {
    const ficha = await criar(() => Promise.reject(new Error('fora do ar'))).detalhar(
      'imola',
      AGORA,
    );

    expect(ficha.verbete).toBeNull();
    expect(ficha.noCalendarioAtual).toBe(false);
    expect(ficha.proximaCorrida).toBeNull();
  });

  it('avisa quando o circuito não existe', async () => {
    await expect(criar().detalhar('inventado', AGORA)).rejects.toThrow(CircuitoNaoEncontrado);
  });
});
