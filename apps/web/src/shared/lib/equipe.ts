import type { CSSProperties } from 'react';

export interface CoresDaEquipe {
  cor: string;
  corSecundaria: string;
}

const COR_NEUTRA = '#8a8d96';
const LUMINANCIA_MINIMA_NO_FUNDO_ESCURO = 0.06;

function luminancia(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((inicio) => {
    const canal = Number.parseInt(hex.slice(inicio, inicio + 2), 16) / 255;

    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function corDeDestaque({ cor, corSecundaria }: CoresDaEquipe) {
  return luminancia(cor) < LUMINANCIA_MINIMA_NO_FUNDO_ESCURO ? corSecundaria : cor;
}

export function corDoTextoSobre(hex: string) {
  return luminancia(hex) > 0.35 ? '#0a0a0b' : '#ffffff';
}

export function estiloDaEquipe(cores?: CoresDaEquipe) {
  return { '--cor-equipe': cores ? corDeDestaque(cores) : COR_NEUTRA } as CSSProperties;
}

export function siglaDaEquipe(nome: string) {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  const sigla =
    palavras.length > 1
      ? palavras
          .slice(0, 3)
          .map((palavra) => palavra[0])
          .join('')
      : (palavras[0] ?? '').slice(0, 3);

  return sigla.toUpperCase();
}
