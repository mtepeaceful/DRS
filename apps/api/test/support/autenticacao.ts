import type { ConfiguracaoDoApp } from '../../src/app.js';
import type { FonteDeDadosDaF1 } from '../../src/application/ports/fonte-de-dados-da-f1.js';
import { gerarHashDaSenha } from '../../src/infra/seguranca/senha.js';
import { emitirToken } from '../../src/infra/seguranca/sessao.js';

export const SENHA_DE_TESTE = 'senha-de-teste-bem-longa';
const SEGREDO_DE_TESTE = 'segredo-de-teste-com-mais-de-32-caracteres';

export const semCalendario = {
  buscarCalendario: async () => [],
  buscarResultado: async () => null,
  buscarParticipacoes: async () => [],
};

const fonteVazia: FonteDeDadosDaF1 = {
  buscarTemporadaAtual: async () => ({ ano: 2026, equipes: [], pilotos: [] }),
};

export const configuracaoDeTeste: ConfiguracaoDoApp = {
  fonteDeDados: fonteVazia,
  historia: {
    buscarCampeoes: async () => [],
    buscarTemporada: () => Promise.reject(new Error('sem histórico nos testes')),
  },
  campeonato: {
    buscarCampeonato: async () => ({
      ano: 2026,
      totalDeRodadas: 0,
      rodadasDisputadas: 0,
      proximaCorrida: null,
      pilotos: [],
      construtores: [],
      ultimaCorrida: null,
    }),
    ...semCalendario,
  },
  noticias: { buscarNoticias: async () => [] },
  autenticacao: { hashDaSenha: await gerarHashDaSenha(SENHA_DE_TESTE), segredo: SEGREDO_DE_TESTE },
};

export const cabecalhoDeSessao = {
  authorization: `Bearer ${emitirToken(SEGREDO_DE_TESTE).token}`,
};
