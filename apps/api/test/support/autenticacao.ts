import type { ConfiguracaoDoApp } from '../../src/app.js';
import { gerarHashDaSenha } from '../../src/infra/seguranca/senha.js';
import { emitirToken } from '../../src/infra/seguranca/sessao.js';

export const SENHA_DE_TESTE = 'senha-de-teste-bem-longa';
const SEGREDO_DE_TESTE = 'segredo-de-teste-com-mais-de-32-caracteres';

export const configuracaoDeTeste: ConfiguracaoDoApp = {
  autenticacao: { hashDaSenha: await gerarHashDaSenha(SENHA_DE_TESTE), segredo: SEGREDO_DE_TESTE },
};

export const cabecalhoDeSessao = {
  authorization: `Bearer ${emitirToken(SEGREDO_DE_TESTE).token}`,
};
