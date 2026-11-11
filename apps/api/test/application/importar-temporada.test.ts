import { beforeEach, describe, expect, it } from 'vitest';
import { ImportarTemporada } from '../../src/application/importacao/importar-temporada.js';
import type {
  FonteDeDadosDaF1,
  Temporada,
} from '../../src/application/ports/fonte-de-dados-da-f1.js';
import {
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../../src/infra/memoria/repositorios-em-memoria.js';

const temporada: Temporada = {
  ano: 2026,
  equipes: [
    { nome: 'Ferrari', cor: '#ed1131', corSecundaria: '#ffffff' },
    { nome: 'McLaren', cor: '#f47600', corSecundaria: '#ffffff' },
  ],
  pilotos: [
    { nome: 'Lewis Hamilton', numero: 44, pais: 'GB', titulos: 7, equipe: 'Ferrari' },
    { nome: 'Lando Norris', numero: 1, pais: 'GB', titulos: 1, equipe: 'McLaren' },
  ],
};

function fonte(dados: Temporada): FonteDeDadosDaF1 {
  return { buscarTemporadaAtual: async () => dados };
}

let equipes: EquipeRepositoryEmMemoria;
let pilotos: PilotoRepositoryEmMemoria;

beforeEach(() => {
  equipes = new EquipeRepositoryEmMemoria();
  pilotos = new PilotoRepositoryEmMemoria(equipes);
});

describe('ImportarTemporada', () => {
  it('cria equipes e pilotos num banco vazio', async () => {
    const resultado = await new ImportarTemporada(pilotos, equipes, fonte(temporada)).executar();

    expect(resultado).toEqual({
      ano: 2026,
      equipes: { criadas: 2, atualizadas: 0 },
      pilotos: { criados: 2, atualizados: 0, ignorados: [] },
    });
    expect(await pilotos.buscarPorNumero(44)).toMatchObject({
      nome: 'Lewis Hamilton',
      titulos: 7,
      equipe: { nome: 'Ferrari', cor: '#ed1131' },
    });
  });

  it('pode rodar de novo sem duplicar nada', async () => {
    const importar = new ImportarTemporada(pilotos, equipes, fonte(temporada));
    await importar.executar();

    const segunda = await importar.executar();
    const { total } = await pilotos.listar({ pagina: 1, porPagina: 50 });

    expect(segunda.equipes).toEqual({ criadas: 0, atualizadas: 2 });
    expect(segunda.pilotos).toMatchObject({ criados: 0, atualizados: 2 });
    expect(total).toBe(2);
  });

  it('atualiza a equipe existente mantendo o nome que já estava cadastrado', async () => {
    await equipes.criar({ nome: 'FERRARI', cor: '#000000', corSecundaria: '#000000' });

    await new ImportarTemporada(pilotos, equipes, fonte(temporada)).executar();

    expect(await equipes.buscarPorNome('ferrari')).toMatchObject({
      nome: 'FERRARI',
      cor: '#ed1131',
    });
  });

  it('pula o piloto cujo número já pertence a outro', async () => {
    const mclaren = await equipes.criar({
      nome: 'McLaren',
      cor: '#000000',
      corSecundaria: '#000000',
    });
    await pilotos.criar({
      nome: 'Ayrton Senna',
      numero: 1,
      pais: 'BR',
      titulos: 3,
      equipeId: mclaren.id,
    });

    const resultado = await new ImportarTemporada(pilotos, equipes, fonte(temporada)).executar();

    expect(resultado.pilotos.ignorados).toEqual([
      { nome: 'Lando Norris', motivo: 'o número 1 já pertence a Ayrton Senna' },
    ]);
    expect(await pilotos.buscarPorNumero(1)).toMatchObject({ nome: 'Ayrton Senna' });
  });

  it('pula o piloto sem país conhecido', async () => {
    const resultado = await new ImportarTemporada(
      pilotos,
      equipes,
      fonte({
        ...temporada,
        pilotos: [
          { nome: 'Piloto Misterioso', numero: 9, pais: null, titulos: 0, equipe: 'Ferrari' },
        ],
      }),
    ).executar();

    expect(resultado.pilotos.ignorados).toEqual([
      { nome: 'Piloto Misterioso', motivo: 'país de origem desconhecido' },
    ]);
  });
});
