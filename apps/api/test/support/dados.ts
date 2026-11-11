import type { DadosEquipe } from '../../src/domain/equipe.js';

export function dadosDaEquipe(nome: string): DadosEquipe {
  return { nome, cor: '#dc0000', corSecundaria: '#ffffff' };
}
