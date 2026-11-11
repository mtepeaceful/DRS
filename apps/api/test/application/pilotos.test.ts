import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { AtualizarPiloto } from '../../src/application/pilotos/atualizar-piloto.js';
import { CadastrarPiloto } from '../../src/application/pilotos/cadastrar-piloto.js';
import { ExcluirPiloto } from '../../src/application/pilotos/excluir-piloto.js';
import { ListarPilotos } from '../../src/application/pilotos/listar-pilotos.js';
import { ObterPiloto } from '../../src/application/pilotos/obter-piloto.js';
import type { Equipe } from '../../src/domain/equipe.js';
import { EquipeInvalida, NumeroJaEmUso, PilotoNaoEncontrado } from '../../src/domain/erros.js';
import type { DadosPiloto } from '../../src/domain/piloto.js';
import {
  dadosDaEquipe,
  EquipeRepositoryEmMemoria,
  PilotoRepositoryEmMemoria,
} from '../support/repositorios-em-memoria.js';

let equipes: EquipeRepositoryEmMemoria;
let pilotos: PilotoRepositoryEmMemoria;
let mclaren: Equipe;
let ferrari: Equipe;

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
  equipes = new EquipeRepositoryEmMemoria();
  pilotos = new PilotoRepositoryEmMemoria(equipes);
  mclaren = await equipes.criar(dadosDaEquipe('McLaren'));
  ferrari = await equipes.criar(dadosDaEquipe('Ferrari'));
});

describe('CadastrarPiloto', () => {
  it('cadastra o piloto com a equipe informada', async () => {
    const piloto = await new CadastrarPiloto(pilotos, equipes).executar(dados());

    expect(piloto).toMatchObject({ nome: 'Ayrton Senna', numero: 12, equipe: mclaren });
  });

  it('recusa uma equipe que não existe', async () => {
    const cadastrar = new CadastrarPiloto(pilotos, equipes);

    await expect(cadastrar.executar(dados({ equipeId: randomUUID() }))).rejects.toThrow(
      EquipeInvalida,
    );
  });

  it('recusa um número que já pertence a outro piloto', async () => {
    const cadastrar = new CadastrarPiloto(pilotos, equipes);
    await cadastrar.executar(dados());

    await expect(cadastrar.executar(dados({ nome: 'Lando Norris' }))).rejects.toThrow(
      NumeroJaEmUso,
    );
  });
});

describe('AtualizarPiloto', () => {
  it('permite manter o próprio número', async () => {
    const criado = await pilotos.criar(dados());
    const atualizar = new AtualizarPiloto(pilotos, equipes);

    const piloto = await atualizar.executar(criado.id, dados({ equipeId: ferrari.id }));

    expect(piloto).toMatchObject({ numero: 12, equipe: ferrari });
  });

  it('recusa o número de outro piloto', async () => {
    await pilotos.criar(dados());
    const prost = await pilotos.criar(dados({ nome: 'Alain Prost', numero: 2 }));
    const atualizar = new AtualizarPiloto(pilotos, equipes);

    await expect(atualizar.executar(prost.id, dados({ nome: 'Alain Prost' }))).rejects.toThrow(
      NumeroJaEmUso,
    );
  });

  it('falha quando o piloto não existe', async () => {
    const atualizar = new AtualizarPiloto(pilotos, equipes);

    await expect(atualizar.executar(randomUUID(), dados())).rejects.toThrow(PilotoNaoEncontrado);
  });
});

describe('ListarPilotos', () => {
  beforeEach(async () => {
    await pilotos.criar(dados());
    await pilotos.criar(dados({ nome: 'Alain Prost', numero: 2 }));
    await pilotos.criar(dados({ nome: 'Charles Leclerc', numero: 16, equipeId: ferrari.id }));
  });

  it('pagina o resultado e informa o total', async () => {
    const pagina = await new ListarPilotos(pilotos).executar({ pagina: 2, porPagina: 2 });

    expect(pagina).toMatchObject({ total: 3, pagina: 2, porPagina: 2 });
    expect(pagina.itens.map((p) => p.nome)).toEqual(['Charles Leclerc']);
  });

  it('busca por nome do piloto ou da equipe', async () => {
    const listar = new ListarPilotos(pilotos);

    const porNome = await listar.executar({ busca: 'prost', pagina: 1, porPagina: 10 });
    const porEquipe = await listar.executar({ busca: 'ferrari', pagina: 1, porPagina: 10 });

    expect(porNome.itens.map((p) => p.nome)).toEqual(['Alain Prost']);
    expect(porEquipe.itens.map((p) => p.nome)).toEqual(['Charles Leclerc']);
  });

  it('trata busca só com espaços como busca vazia', async () => {
    const pagina = await new ListarPilotos(pilotos).executar({
      busca: '   ',
      pagina: 1,
      porPagina: 10,
    });

    expect(pagina.total).toBe(3);
  });
});

describe('ObterPiloto e ExcluirPiloto', () => {
  it('obtém um piloto pelo id', async () => {
    const criado = await pilotos.criar(dados());

    await expect(new ObterPiloto(pilotos).executar(criado.id)).resolves.toEqual(criado);
  });

  it('falha ao obter um piloto que não existe', async () => {
    await expect(new ObterPiloto(pilotos).executar(randomUUID())).rejects.toThrow(
      PilotoNaoEncontrado,
    );
  });

  it('exclui o piloto', async () => {
    const criado = await pilotos.criar(dados());

    await new ExcluirPiloto(pilotos).executar(criado.id);

    await expect(pilotos.buscarPorId(criado.id)).resolves.toBeNull();
  });

  it('falha ao excluir um piloto que não existe', async () => {
    await expect(new ExcluirPiloto(pilotos).executar(randomUUID())).rejects.toThrow(
      PilotoNaoEncontrado,
    );
  });
});
