import { idiomaAtual } from '../../shared/i18n/idioma';

export function rotuloDeTitulos(titulos: number) {
  if (idiomaAtual() === 'en') {
    return titulos === 1 ? '1 world title' : `${titulos} world titles`;
  }

  return titulos === 1 ? '1 título mundial' : `${titulos} títulos mundiais`;
}
