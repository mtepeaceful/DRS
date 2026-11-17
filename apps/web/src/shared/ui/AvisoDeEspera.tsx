import { useTextos } from '../i18n/idioma';
import styles from './AvisoDeEspera.module.css';

const TEXTOS = {
  pt: {
    aviso:
      'Buscando os dados. Se o site ficou um tempo parado, o servidor leva até um minuto para acordar.',
  },
  en: {
    aviso:
      'Fetching the data. If the site has been idle for a while, the server takes up to a minute to wake up.',
  },
};

export function AvisoDeEspera({ ativo }: { ativo: boolean }) {
  const t = useTextos(TEXTOS);

  return (
    <div className={styles.lugar} role="status">
      {ativo && <p className={styles.aviso}>{t.aviso}</p>}
    </div>
  );
}
