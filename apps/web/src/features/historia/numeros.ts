import { porIdioma } from '../../shared/i18n/idioma';

const formato = porIdioma((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }));

export function pontos(valor: number) {
  return formato().format(valor);
}
