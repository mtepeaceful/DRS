import { describe, expect, it } from 'vitest';
import { CadastrarEquipe } from '../../src/application/equipes/cadastrar-equipe.js';
import { ListarEquipes } from '../../src/application/equipes/listar-equipes.js';
import { EquipeJaExiste } from '../../src/domain/erros.js';
import { EquipeRepositoryEmMemoria } from '../support/repositorios-em-memoria.js';

describe('CadastrarEquipe', () => {
  it('recusa nome repetido, ignorando maiúsculas e minúsculas', async () => {
    const cadastrar = new CadastrarEquipe(new EquipeRepositoryEmMemoria());
    await cadastrar.executar({ nome: 'Ferrari' });

    await expect(cadastrar.executar({ nome: 'ferrari' })).rejects.toThrow(EquipeJaExiste);
  });
});

describe('ListarEquipes', () => {
  it('lista as equipes em ordem alfabética', async () => {
    const equipes = new EquipeRepositoryEmMemoria();
    await equipes.criar({ nome: 'Williams' });
    await equipes.criar({ nome: 'Ferrari' });

    const lista = await new ListarEquipes(equipes).executar();

    expect(lista.map((e) => e.nome)).toEqual(['Ferrari', 'Williams']);
  });
});
