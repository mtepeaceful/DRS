import { describe, expect, it } from 'vitest';
import { ConsultarPilotosDaHistoria } from '../../src/application/historia/consultar-pilotos-da-historia.js';
import type { FonteDaHistoria, PilotoDaF1 } from '../../src/application/ports/fonte-da-historia.js';
import type { Enciclopedia } from '../../src/application/ports/fonte-das-equipes.js';
import { PilotoNaoEncontrado } from '../../src/domain/erros.js';
import { CampeoesRepositoryEmMemoria } from '../../src/infra/memoria/repositorios-em-memoria.js';

const pilotos: PilotoDaF1[] = [
  {
    id: 'senna',
    nome: 'Ayrton Senna',
    pais: 'BR',
    nascimento: '1960-03-21',
    wikipedia: 'Ayrton Senna',
  },
  { id: 'perez', nome: 'Sergio Pérez', pais: 'MX', nascimento: null, wikipedia: null },
  { id: 'fangio', nome: 'Juan Fangio', pais: 'AR', nascimento: null, wikipedia: null },
];

async function criar(verbete: Enciclopedia['verbete'] = async () => null) {
  const campeoes = new CampeoesRepositoryEmMemoria();
  await campeoes.guardar(
    [1988, 1990, 1991].map((ano) => ({
      ano,
      sigla: 'SEN',
      piloto: 'Ayrton Senna',
      pais: 'BR',
      equipe: 'McLaren',
      pontos: 1,
      vitorias: 1,
      construtor: null,
    })),
  );
  const fonte: FonteDaHistoria = {
    buscarCampeoes: async () => [],
    buscarTemporada: () => Promise.reject(new Error('não usado')),
    listarPilotos: async () => pilotos,
    buscarCarreira: async () => ({
      temporadas: [1984, 1994],
      corridas: 161,
      vitorias: 41,
      podios: 80,
      poles: 65,
      equipes: [{ id: 'mclaren', nome: 'McLaren' }],
    }),
  };

  return new ConsultarPilotosDaHistoria(fonte, campeoes, { verbete });
}

describe('ConsultarPilotosDaHistoria', () => {
  it('lista em ordem alfabética com os títulos de cada um', async () => {
    const lista = await (await criar()).listar();

    expect(lista.map((p) => [p.nome, p.titulos])).toEqual([
      ['Ayrton Senna', 3],
      ['Juan Fangio', 0],
      ['Sergio Pérez', 0],
    ]);
  });

  it('monta a ficha com a carreira, os anos de título e o verbete', async () => {
    const ficha = await (
      await criar(async () => ({
        resumo: 'Tricampeão mundial.',
        fonte: 'https://pt.wikipedia.org/wiki/Ayrton_Senna',
        foto: null,
        fundacao: null,
        fundadores: [],
        sede: null,
      }))
    ).detalhar('senna');

    expect(ficha).toMatchObject({
      nome: 'Ayrton Senna',
      vitorias: 41,
      anosDeTitulo: [1988, 1990, 1991],
      equipes: [{ id: 'mclaren', nome: 'McLaren' }],
      verbete: { resumo: 'Tricampeão mundial.' },
    });
  });

  it('segue sem o verbete quando a enciclopédia falha', async () => {
    const ficha = await (
      await criar(() => Promise.reject(new Error('fora do ar')))
    ).detalhar('senna');

    expect(ficha.verbete).toBeNull();
  });

  it('avisa quando o piloto não existe', async () => {
    await expect((await criar()).detalhar('inventado')).rejects.toThrow(PilotoNaoEncontrado);
  });
});
