import { useSyncExternalStore } from 'react';

const CHAVE = 'drs:sessao';

interface Sessao {
  token: string;
  expiraEm: number;
}

const ouvintes = new Set<() => void>();

function ler(): Sessao | null {
  try {
    const salva = sessionStorage.getItem(CHAVE);
    const sessao = salva ? (JSON.parse(salva) as Sessao) : null;

    return sessao && sessao.expiraEm > Date.now() ? sessao : null;
  } catch {
    return null;
  }
}

let atual = ler();

function avisar() {
  for (const ouvinte of ouvintes) {
    ouvinte();
  }
}

export function iniciarSessao(token: string, expiraEm: string) {
  atual = { token, expiraEm: Date.parse(expiraEm) };

  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    return avisar();
  }

  avisar();
}

export function encerrarSessao() {
  atual = null;

  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    return avisar();
  }

  avisar();
}

export function tokenDaSessao() {
  if (atual && atual.expiraEm <= Date.now()) {
    encerrarSessao();
  }

  return atual?.token;
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);

  return () => ouvintes.delete(ouvinte);
}

export function useSessaoAtiva() {
  return useSyncExternalStore(assinar, () => tokenDaSessao() !== undefined);
}
