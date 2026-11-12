import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest';
import type { Equipe } from '../../src/domain/equipe.js';
import { EquipeJaExiste, EquipeInvalida, NumeroJaEmUso } from '../../src/domain/erros.js';
import type { DadosPiloto } from '../../src/domain/piloto.js';
import { conectar } from '../../src/infra/database/client.js';
import { EquipeRepositoryDrizzle } from '../../src/infra/database/equipe-repository-drizzle.js';
import { ImportacaoRepositoryDrizzle } from '../../src/infra/database/importacao-repository-drizzle.js';
import { PilotoRepositoryDrizzle } from '../../src/infra/database/piloto-repository-drizzle.js';
import { dadosDaEquipe } from '../support/dados.js';

const { db, fechar } = conectar(inject('databaseUrl'));
const equipes = new EquipeRepositoryDrizzle(db);
const pilotos = new PilotoRepositoryDrizzle(db);
const importacoes = new ImportacaoRepositoryDrizzle(db);
let mclaren: Equipe;

function dados(sobrescrita: Partial<DadosPiloto> = {}): DadosPiloto {
  return {
    nome: 'Ayrton Senna',
    numero: 12,
    pais: 'BR',
    equipeId: mclaren.id,
    titulos: 3,
    ...sobrescrita,
  };
}

beforeEach(async () => {
  await db.execute(sql`truncate table pilotos, equipes, campeoes, importacoes`);
  mclaren = await equipes.criar(dadosDaEquipe('McLaren'));
});

afterAll(() => fechar());

describe('EquipeRepositoryDrizzle', () => {
  it('encontra a equipe pelo nome sem diferenciar maiúsculas', async () => {
    await expect(equipes.buscarPorNome('MCLAREN')).resolves.toEqual(mclaren);
  });

  it('converte o nome repetido em EquipeJaExiste', async () => {
    await expect(equipes.criar(dadosDaEquipe('mclaren'))).rejects.toThrow(EquipeJaExiste);
  });

  it('atualiza as cores da equipe', async () => {
    const atualizada = await equipes.atualizar(mclaren.id, {
      nome: 'McLaren',
      cor: '#ff8000',
      corSecundaria: '#000000',
    });

    expect(atualizada).toEqual({ ...mclaren, cor: '#ff8000', corSecundaria: '#000000' });
  });
});

describe('PilotoRepositoryDrizzle', () => {
  it('grava e lê o piloto com a equipe', async () => {
    const criado = await pilotos.criar(dados());

    expect(criado).toMatchObject({ nome: 'Ayrton Senna', numero: 12, equipe: mclaren });
    await expect(pilotos.buscarPorId(criado.id)).resolves.toEqual(criado);
  });

  it('converte o número repetido em NumeroJaEmUso', async () => {
    await pilotos.criar(dados());

    await expect(pilotos.criar(dados({ nome: 'Lando Norris' }))).rejects.toThrow(NumeroJaEmUso);
  });

  it('converte a equipe inexistente em EquipeInvalida', async () => {
    await expect(pilotos.criar(dados({ equipeId: randomUUID() }))).rejects.toThrow(EquipeInvalida);
  });

  it('pagina e busca pelo nome da equipe', async () => {
    const ferrari = await equipes.criar(dadosDaEquipe('Ferrari'));
    await pilotos.criar(dados());
    await pilotos.criar(dados({ nome: 'Alain Prost', numero: 2 }));
    await pilotos.criar(dados({ nome: 'Charles Leclerc', numero: 16, equipeId: ferrari.id }));

    const pagina = await pilotos.listar({ pagina: 2, porPagina: 2 });
    const busca = await pilotos.listar({ busca: 'ferr', pagina: 1, porPagina: 10 });

    expect(pagina.total).toBe(3);
    expect(pagina.itens.map((p) => p.nome)).toEqual(['Charles Leclerc']);
    expect(busca.itens.map((p) => p.nome)).toEqual(['Charles Leclerc']);
  });

  it('trata % e _ da busca como texto comum', async () => {
    await pilotos.criar(dados());

    await expect(pilotos.listar({ busca: '%', pagina: 1, porPagina: 10 })).resolves.toEqual({
      itens: [],
      total: 0,
    });
  });

  it('atualiza e exclui', async () => {
    const criado = await pilotos.criar(dados());

    const atualizado = await pilotos.atualizar(criado.id, dados({ numero: 1 }));

    expect(atualizado?.numero).toBe(1);
    expect(atualizado?.atualizadoEm.getTime()).toBeGreaterThanOrEqual(
      criado.atualizadoEm.getTime(),
    );
    await expect(pilotos.excluir(criado.id)).resolves.toBe(true);
    await expect(pilotos.excluir(criado.id)).resolves.toBe(false);
  });

  it('não atualiza um piloto que não existe', async () => {
    await expect(pilotos.atualizar(randomUUID(), dados())).resolves.toBeNull();
  });
});

describe('ImportacaoRepositoryDrizzle', () => {
  it('guarda campeões sem duplicar anos já conhecidos', async () => {
    await importacoes.guardarCampeoes([
      { ano: 1996, sigla: null },
      { ano: 2020, sigla: 'HAM' },
    ]);
    await importacoes.guardarCampeoes([
      { ano: 2020, sigla: 'XXX' },
      { ano: 2021, sigla: 'VER' },
    ]);

    const campeoes = await importacoes.listarCampeoes();

    expect(campeoes.toSorted((a, b) => a.ano - b.ano)).toEqual([
      { ano: 1996, sigla: null },
      { ano: 2020, sigla: 'HAM' },
      { ano: 2021, sigla: 'VER' },
    ]);
  });

  it('recusa sigla fora do padrão', async () => {
    await expect(importacoes.guardarCampeoes([{ ano: 2022, sigla: 'ver' }])).rejects.toThrow();
  });

  it('devolve a importação mais recente', async () => {
    expect(await importacoes.ultimaImportacao()).toBeNull();

    await importacoes.registrarImportacao(new Date('2026-11-10T08:00:00Z'));
    await importacoes.registrarImportacao(new Date('2026-11-11T08:00:00Z'));
    await importacoes.registrarImportacao(new Date('2026-11-09T08:00:00Z'));

    expect(await importacoes.ultimaImportacao()).toEqual(new Date('2026-11-11T08:00:00Z'));
  });
});
