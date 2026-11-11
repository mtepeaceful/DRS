import type { CSSProperties } from 'react';

const FNV_BASE = 0x811c9dc5;
const FNV_PRIMO = 0x01000193;

export function corDaEquipe(nome: string) {
  let hash = FNV_BASE;

  for (const caractere of nome.trim().toLowerCase()) {
    hash = Math.imul(hash ^ (caractere.codePointAt(0) ?? 0), FNV_PRIMO) >>> 0;
  }

  return `hsl(${hash % 360} 85% 62%)`;
}

export function estiloDaEquipe(nome: string) {
  return { '--cor-equipe': corDaEquipe(nome) } as CSSProperties;
}
