import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AtualizarEquipe } from '../../src/application/equipes/atualizar-equipe.js';
import { CadastrarEquipe } from '../../src/application/equipes/cadastrar-equipe.js';
import { ListarEquipes } from '../../src/application/equipes/listar-equipes.js';
import { EquipeJaExiste, EquipeNaoEncontrada } from '../../src/domain/erros.js';
import { EquipeRepositoryEmMemoria } from '../../src/infra/memoria/repositorios-em-memoria.js';
import { dadosDaEquipe } from '../support/dados.js';

describe('CadastrarEquipe', () => {
  it('recusa nome repetido, ignorando maiúsculas e minúsculas', async () => {
    const cadastrar = new CadastrarEquipe(new EquipeRepositoryEmMemoria());
    await cadastrar.executar(dadosDaEquipe('Ferrari'));

    await expect(cadastrar.executar(dadosDaEquipe('ferrari'))).rejects.toThrow(EquipeJaExiste);
  });
});

describe('ListarEquipes', () => {
  it('lista as equipes em ordem alfabética', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    await equipes.criar(dadosDaEquipe('Williams'));
    await equipes.criar(dadosDaEquipe('Ferrari'));

    const lista = await new ListarEquipes(equipes).executar();

    expect(lista.map((e) => e.nome)).toEqual(['Ferrari', 'Williams']);
  });
});

describe('AtualizarEquipe', () => {
  it('troca as cores mantendo o próprio nome', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    const ferrari = await equipes.criar(dadosDaEquipe('Ferrari'));

    const atualizada = await new AtualizarEquipe(equipes).executar(ferrari.id, {
      nome: 'Ferrari',
      cor: '#a00000',
      corSecundaria: '#000000',
    });

    expect(atualizada).toEqual({ ...ferrari, cor: '#a00000', corSecundaria: '#000000' });
  });

  it('recusa o nome de outra equipe', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    await equipes.criar(dadosDaEquipe('Ferrari'));
    const williams = await equipes.criar(dadosDaEquipe('Williams'));

    await expect(
      new AtualizarEquipe(equipes).executar(williams.id, dadosDaEquipe('ferrari')),
    ).rejects.toThrow(EquipeJaExiste);
  });

  it('falha quando a equipe não existe', async () => {
    const atualizar = new AtualizarEquipe(new EquipeRepositoryEmMemoria());

    await expect(atualizar.executar(randomUUID(), dadosDaEquipe('Ferrari'))).rejects.toThrow(
      EquipeNaoEncontrada,
    );
  });
});
