import { trocarIdioma, useIdioma } from '../i18n/idioma';
import styles from './SeletorDeIdioma.module.css';

export function SeletorDeIdioma() {
  const idioma = useIdioma();
  const outro = idioma === 'pt' ? 'en' : 'pt';

  return (
    <button
      type="button"
      className={styles.seletor}
      lang={outro === 'en' ? 'en' : 'pt-BR'}
      aria-label={outro === 'en' ? 'Read in English' : 'Ler em português'}
      onClick={() => trocarIdioma(outro)}
    >
      {outro.toUpperCase()}
    </button>
  );
}
