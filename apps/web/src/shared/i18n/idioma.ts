import { useSyncExternalStore } from 'react';

export type Idioma = 'pt' | 'en';

export type Textos<T> = Record<Idioma, T>;

const CHAVE = 'drs-idioma';
const ouvintes = new Set<() => void>();

function idiomaValido(valor: string | null | undefined): Idioma | null {
  return valor === 'pt' || valor === 'en' ? valor : null;
}

function idiomaInicial(): Idioma {
  if (typeof window === 'undefined') return 'pt';

  const daUrl = idiomaValido(new URLSearchParams(window.location.search).get('lang'));
  if (daUrl) return daUrl;

  try {
    const salvo = idiomaValido(window.localStorage.getItem(CHAVE));
    if (salvo) return salvo;
  } catch {
    // Sem acesso ao armazenamento: segue o navegador.
  }

  return window.navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

let atual: Idioma = idiomaInicial();
aplicarNoDocumento(atual);

function aplicarNoDocumento(idioma: Idioma) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
  }
}

export function idiomaAtual() {
  return atual;
}

export function trocarIdioma(idioma: Idioma) {
  if (idioma === atual) return;

  atual = idioma;
  aplicarNoDocumento(idioma);
  try {
    window.localStorage.setItem(CHAVE, idioma);
  } catch {
    // A escolha vale só nesta visita.
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);

  return () => ouvintes.delete(ouvinte);
}

export function useIdioma(): Idioma {
  return useSyncExternalStore(
    assinar,
    () => atual,
    () => 'pt' as const,
  );
}

export function useTextos<T>(textos: { pt: T; en: NoInfer<T> }): T {
  return textos[useIdioma()];
}

export function localeDo(idioma: Idioma) {
  return idioma === 'en' ? 'en-US' : 'pt-BR';
}

export function useLocale() {
  return localeDo(useIdioma());
}

/** Cria o formatador do Intl no idioma atual, uma vez por idioma. */
export function porIdioma<T>(criar: (locale: string) => T): () => T {
  const criados = new Map<Idioma, T>();

  return () => {
    const idioma = idiomaAtual();
    let formatador = criados.get(idioma);
    if (!formatador) {
      formatador = criar(localeDo(idioma));
      criados.set(idioma, formatador);
    }

    return formatador;
  };
}
