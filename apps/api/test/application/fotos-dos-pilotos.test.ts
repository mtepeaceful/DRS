import { describe, expect, it } from 'vitest';
import { FotosDosPilotos } from '../../src/application/pilotos/fotos-dos-pilotos.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

function foto(arquivo: string) {
  return {
    url: `https://upload.wikimedia.org/wikipedia/commons/${arquivo}`,
    pagina: `https://commons.wikimedia.org/wiki/File:${arquivo}`,
    autor: null,
    licenca: 'CC BY 2.0',
  };
}

describe('Fotos dos pilotos do grid', () => {
  it('casa o nome com o piloto da F1 e devolve só quem tem foto', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    const pilotos = new PilotoRepositoryEmMemoria(equipes);
    const equipe = await equipes.criar(dadosDaEquipe('Ferrari'));
    const criar = (nome: string, numero: number) =>
      pilotos.criar({ nome, numero, pais: 'BR', titulos: 0, equipeId: equipe.id });
    const senna = await criar('Ayrton Senna', 12);
    await criar('Rubens Barrichello', 11);
    await criar('Piloto Inventado', 99);
    const pedidos: string[] = [];

    const fotos = await new FotosDosPilotos(
      pilotos,
      {
        buscarCampeoes: async () => [],
        buscarTemporada: () => Promise.reject(new Error('não usado')),
        buscarCarreira: () => Promise.reject(new Error('não usado')),
        listarPilotos: async () => [
          { id: 'senna', nome: 'Ayrton Sénna', pais: 'BR', nascimento: null, wikipedia: 'Senna' },
          {
            id: 'barrichello',
            nome: 'Rubens Barrichello',
            pais: 'BR',
            nascimento: null,
            wikipedia: 'Barrichello',
          },
        ],
      },
      {
        foto: async (artigo) => {
          pedidos.push(artigo);

          return artigo === 'Senna' ? foto('Senna.jpg') : null;
        },
      },
    ).executar();

    expect(fotos).toEqual([
      { id: senna.id, foto: expect.objectContaining({ licenca: 'CC BY 2.0' }) },
    ]);
    expect(pedidos.toSorted()).toEqual(['Barrichello', 'Senna']);
  });

  it('ignora a falha de um verbete sem derrubar os outros', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    const pilotos = new PilotoRepositoryEmMemoria(equipes);
    const equipe = await equipes.criar(dadosDaEquipe('Ferrari'));
    await pilotos.criar({
      nome: 'Ayrton Senna',
      numero: 12,
      pais: 'BR',
      titulos: 3,
      equipeId: equipe.id,
    });

    const fotos = await new FotosDosPilotos(
      pilotos,
      {
        buscarCampeoes: async () => [],
        buscarTemporada: () => Promise.reject(new Error('não usado')),
        buscarCarreira: () => Promise.reject(new Error('não usado')),
        listarPilotos: async () => [
          { id: 'senna', nome: 'Ayrton Senna', pais: 'BR', nascimento: null, wikipedia: 'Senna' },
        ],
      },
      { foto: () => Promise.reject(new Error('Wikipédia fora do ar')) },
    ).executar();

    expect(fotos).toEqual([]);
  });
});
