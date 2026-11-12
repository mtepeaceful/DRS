import { describe, expect, it } from 'vitest';
import { ConsultarDicionario } from '../../src/application/equipes/consultar-dicionario.js';
import type { Campeao } from '../../src/application/ports/fonte-da-historia.js';
import type {
  Enciclopedia,
  EquipeDaHistoria,
  FonteDasEquipes,
} from '../../src/application/ports/fonte-das-equipes.js';
import type {
  Campeonato,
  FonteDoCampeonato,
} from '../../src/application/ports/fonte-do-campeonato.js';
import { EquipeNaoEncontrada } from '../../src/domain/erros.js';
import { CampeoesRepositoryEmMemoria } from '../../src/infra/memoria/repositorios-em-memoria.js';

const AGORA = new Date('2026-11-12T12:00:00Z');

const equipes: EquipeDaHistoria[] = [
  { id: 'team_lotus', nome: 'Team Lotus', pais: 'GB', wikipedia: 'Team Lotus' },
  { id: 'ferrari', nome: 'Ferrari', pais: 'IT', wikipedia: 'Scuderia Ferrari' },
  { id: 'brabham', nome: 'Brabham', pais: 'GB', wikipedia: null },
];

function campeao(ano: number, piloto: string, equipe: string, construtor: string | null): Campeao {
  return {
    ano,
    sigla: null,
    piloto,
    pais: null,
    equipe,
    pontos: 1,
    vitorias: 1,
    construtor: construtor === null ? null : { nome: construtor, pontos: 1, vitorias: 1 },
  };
}

const campeonato: Campeonato = {
  ano: 2026,
  totalDeRodadas: 23,
  rodadasDisputadas: 20,
  proximaCorrida: null,
  ultimaCorrida: null,
  pilotos: [
    { posicao: 4, nome: 'Lewis Hamilton', equipe: 'Ferrari', pontos: 261, vitorias: 1 },
    { posicao: 5, nome: 'Charles Leclerc', equipe: 'Ferrari', pontos: 249, vitorias: 1 },
    { posicao: 1, nome: 'Andrea Kimi Antonelli', equipe: 'Mercedes', pontos: 390, vitorias: 9 },
  ],
  construtores: [{ posicao: 2, nome: 'Ferrari', pontos: 510, vitorias: 2 }],
};

async function criar(enciclopedia: Enciclopedia = { verbete: async () => null }) {
  const campeoes = new CampeoesRepositoryEmMemoria();
  await campeoes.guardar([
    campeao(1963, 'Jim Clark', 'Team Lotus', 'Team Lotus'),
    campeao(1952, 'Alberto Ascari', 'Ferrari', null),
    campeao(1964, 'John Surtees', 'Ferrari', 'Ferrari'),
    campeao(1966, 'Jack Brabham', 'Brabham', 'Brabham-Repco'),
  ]);
  const fonte: FonteDasEquipes = {
    listar: async () => equipes,
    numeros: async () => ({
      temporadas: [1950, 2026],
      corridas: 1144,
      vitorias: 251,
      podios: 830,
      poles: 260,
    }),
  };
  const campeonatoAtual: FonteDoCampeonato = {
    buscarCampeonato: async () => campeonato,
    buscarCalendario: async () => [],
    buscarResultado: async () => null,
    buscarParticipacoes: async () => [],
  };

  return new ConsultarDicionario(fonte, enciclopedia, campeoes, campeonatoAtual);
}

describe('ConsultarDicionario', () => {
  it('lista em ordem alfabética com títulos e quem está no grid atual', async () => {
    const lista = await (await criar()).listar(AGORA);

    expect(
      lista.map((e) => [e.nome, e.titulosDeConstrutores, e.titulosDePilotos, e.noGridAtual]),
    ).toEqual([
      ['Brabham', 0, 1, false],
      ['Ferrari', 1, 2, true],
      ['Team Lotus', 1, 1, false],
    ]);
  });

  it('monta a ficha com títulos, campeões e a temporada atual da equipe', async () => {
    const ficha = await (await criar()).detalhar('ferrari', AGORA);

    expect(ficha).toMatchObject({
      nome: 'Ferrari',
      vitorias: 251,
      anosDeTitulo: [1964],
      campeoesDePilotos: [
        { ano: 1952, piloto: 'Alberto Ascari' },
        { ano: 1964, piloto: 'John Surtees' },
      ],
      temporadaAtual: {
        posicao: 2,
        pontos: 510,
        pilotos: [
          { nome: 'Lewis Hamilton', pontos: 261 },
          { nome: 'Charles Leclerc', pontos: 249 },
        ],
      },
    });
  });

  it('segue sem o verbete quando a enciclopédia está fora do ar', async () => {
    const dicionario = await criar({ verbete: () => Promise.reject(new Error('fora do ar')) });

    const ficha = await dicionario.detalhar('team_lotus', AGORA);

    expect(ficha.verbete).toBeNull();
    expect(ficha.temporadaAtual).toBeNull();
  });

  it('não consulta a enciclopédia quando a equipe não tem artigo', async () => {
    let consultas = 0;
    const dicionario = await criar({
      verbete: async () => {
        consultas++;

        return null;
      },
    });

    await dicionario.detalhar('brabham', AGORA);

    expect(consultas).toBe(0);
  });

  it('avisa quando a equipe não existe', async () => {
    await expect((await criar()).detalhar('inventada', AGORA)).rejects.toThrow(EquipeNaoEncontrada);
  });
});
