import { describe, expect, it } from 'vitest';
import type { CarreiraNaF1 } from '../../src/application/ports/fonte-da-historia.js';
import { ConsultarCarreira } from '../../src/application/pilotos/consultar-carreira.js';
import { PilotoNaoEncontrado } from '../../src/domain/erros.js';
import {
  CampeoesRepositoryEmMemoria,
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

const carreira: CarreiraNaF1 = {
  temporadas: [2007, 2008, 2026],
  corridas: 400,
  vitorias: 106,
  podios: 204,
  poles: 105,
  equipes: [{ id: 'mclaren', nome: 'McLaren' }],
};

async function preparar(encontrada: boolean) {
  const equipes = new EquipeRepositoryEmMemoria();
  const pilotos = new PilotoRepositoryEmMemoria(equipes);
  const campeoes = new CampeoesRepositoryEmMemoria();
  const ferrari = await equipes.criar(dadosDaEquipe('Ferrari'));
  const hamilton = await pilotos.criar({
    nome: 'Lewis Hamilton',
    numero: 44,
    pais: 'GB',
    titulos: 7,
    equipeId: ferrari.id,
  });
  await campeoes.guardar(
    [2020, 2008, 2014].map((ano) => ({
      ano,
      sigla: 'HAM',
      piloto: 'Lewis Hamilton',
      pais: 'GB',
      equipe: 'Mercedes',
      pontos: 300,
      vitorias: 10,
      construtor: null,
    })),
  );
  const consultar = new ConsultarCarreira(pilotos, campeoes, {
    buscarCampeoes: async () => [],
    buscarTemporada: () => Promise.reject(new Error('não usado')),
    listarPilotos: async () =>
      encontrada
        ? [
            {
              id: 'hamilton',
              nome: 'Lewis Hamilton',
              pais: 'GB',
              nascimento: '1985-01-07',
              wikipedia: null,
            },
          ]
        : [],
    buscarCarreira: async (id) => {
      expect(id).toBe('hamilton');

      return carreira;
    },
  });

  return { consultar, id: hamilton.id };
}

describe('ConsultarCarreira', () => {
  it('junta a carreira da fonte com os anos de título guardados', async () => {
    const { consultar, id } = await preparar(true);

    expect(await consultar.executar(id)).toEqual({
      nascimento: '1985-01-07',
      estreia: 2007,
      temporadas: 3,
      corridas: 400,
      vitorias: 106,
      podios: 204,
      poles: 105,
      titulos: [2008, 2014, 2020],
    });
  });

  it('devolve nulo quando a fonte não conhece o piloto', async () => {
    const { consultar, id } = await preparar(false);

    expect(await consultar.executar(id)).toBeNull();
  });

  it('avisa quando o piloto não existe', async () => {
    const { consultar } = await preparar(true);

    await expect(consultar.executar(crypto.randomUUID())).rejects.toThrow(PilotoNaoEncontrado);
  });
});
