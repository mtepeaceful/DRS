import { describe, expect, it } from 'vitest';
import type { FonteDaHistoria } from '../../src/application/ports/fonte-da-historia.js';
import { PreencherFotosDosPilotos } from '../../src/application/pilotos/preencher-fotos-dos-pilotos.js';
import type { Foto } from '../../src/domain/foto.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

function foto(arquivo: string, licenca: string | null = 'CC BY 2.0'): Foto {
  return {
    url: `https://upload.wikimedia.org/wikipedia/commons/${arquivo}`,
    pagina: `https://commons.wikimedia.org/wiki/File:${arquivo}`,
    autor: null,
    licenca,
  };
}

const fonte: FonteDaHistoria = {
  buscarCampeoes: async () => [],
  buscarTemporada: () => Promise.reject(new Error('não usado')),
  buscarCarreira: () => Promise.reject(new Error('não usado')),
  listarPilotos: async () => [
    { id: 'senna', nome: 'Ayrton Sénna', pais: 'BR', nascimento: null, wikipedia: 'Senna' },
    { id: 'prost', nome: 'Alain Prost', pais: 'FR', nascimento: null, wikipedia: 'Prost' },
    { id: 'piquet', nome: 'Nelson Piquet', pais: 'BR', nascimento: null, wikipedia: 'Piquet' },
  ],
};

async function preparar() {
  const equipes = new EquipeRepositoryEmMemoria();
  const pilotos = new PilotoRepositoryEmMemoria(equipes);
  const equipe = await equipes.criar(dadosDaEquipe('McLaren'));
  const criar = (nome: string, numero: number) =>
    pilotos.criar({ nome, numero, pais: 'BR', titulos: 0, equipeId: equipe.id });

  return {
    pilotos,
    senna: await criar('Ayrton Senna', 12),
    prost: await criar('Alain Prost', 2),
    piquet: await criar('Nelson Piquet', 6),
    inventado: await criar('Piloto Inventado', 99),
  };
}

describe('Preencher as fotos dos pilotos', () => {
  it('guarda só as fotos com licença e não consulta quem já tem foto', async () => {
    const { pilotos, senna, prost, piquet } = await preparar();
    await pilotos.guardarFoto(piquet.id, foto('Piquet.jpg'));
    const pedidos: string[] = [];

    const resultado = await new PreencherFotosDosPilotos(pilotos, fonte, {
      foto: async (artigo) => {
        pedidos.push(artigo);

        if (artigo === 'Senna') return foto('Senna.jpg');
        if (artigo === 'Prost') return foto('Prost.jpg', null);

        return null;
      },
    }).executar();

    expect(resultado).toEqual({ guardadas: 1, semFoto: 2 });
    expect(pedidos.toSorted()).toEqual(['Prost', 'Senna']);
    expect((await pilotos.buscarPorId(senna.id))?.foto?.url).toContain('Senna.jpg');
    expect((await pilotos.buscarPorId(prost.id))?.foto).toBeNull();
    expect((await pilotos.buscarPorId(piquet.id))?.foto?.url).toContain('Piquet.jpg');
  });

  it('segue para os próximos quando uma consulta falha e não apaga foto guardada', async () => {
    const { pilotos, senna, prost } = await preparar();
    await pilotos.guardarFoto(prost.id, foto('Prost.jpg'));

    const resultado = await new PreencherFotosDosPilotos(pilotos, fonte, {
      foto: (artigo) =>
        artigo === 'Senna'
          ? Promise.reject(new Error('Wikipédia fora do ar'))
          : Promise.resolve(foto(`${artigo}.jpg`)),
    }).executar();

    expect(resultado.guardadas).toBe(1);
    expect((await pilotos.buscarPorId(senna.id))?.foto).toBeNull();
    expect((await pilotos.buscarPorId(prost.id))?.foto?.url).toContain('Prost.jpg');
  });

  it('não consulta nada quando todos já têm foto', async () => {
    const { pilotos, senna, prost, piquet, inventado } = await preparar();
    for (const piloto of [senna, prost, piquet, inventado]) {
      await pilotos.guardarFoto(piloto.id, foto('x.jpg'));
    }

    const resultado = await new PreencherFotosDosPilotos(
      pilotos,
      { ...fonte, listarPilotos: () => Promise.reject(new Error('não deveria consultar')) },
      { foto: () => Promise.reject(new Error('não deveria consultar')) },
    ).executar();

    expect(resultado).toEqual({ guardadas: 0, semFoto: 0 });
  });
});
