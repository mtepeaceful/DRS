import { idiomaAtual } from '../../shared/i18n/idioma';
import { CATEGORIAS, type Categoria, type Termo, TERMOS } from './termos';
import { CATEGORIAS_EN, TERMOS_EN } from './termos.en';

const TERMOS_TRADUZIDOS: Termo[] = TERMOS.map((termo) => {
  const en = TERMOS_EN[termo.id];
  if (!en) return termo;

  const { id, categoria, relacionados, noSite } = termo;

  return {
    id,
    categoria,
    relacionados,
    nome: en.nome,
    definicao: en.definicao,
    ...(en.tambem ? { tambem: en.tambem } : {}),
    ...(noSite ? { noSite: { ...noSite, texto: en.noSite ?? noSite.texto } } : {}),
  };
});

export function termosNoIdioma(): Termo[] {
  return idiomaAtual() === 'en' ? TERMOS_TRADUZIDOS : TERMOS;
}

export function categoriasNoIdioma(): Record<Categoria, string> {
  return idiomaAtual() === 'en' ? CATEGORIAS_EN : CATEGORIAS;
}

export function nomeDoTermo(id: string) {
  return termosNoIdioma().find((termo) => termo.id === id)?.nome;
}
