import { useTextos } from '../i18n/idioma';
import { AsaTraseira } from './AsaTraseira';
import styles from './CarregandoPagina.module.css';

const TEXTOS = {
  pt: { carregando: 'Carregando o DRS…' },
  en: { carregando: 'Loading DRS…' },
};

export function CarregandoPagina() {
  const t = useTextos(TEXTOS);

  return (
    <div className={styles.carregando} role="status">
      <AsaTraseira aberta />
      <span className="apenas-leitor">{t.carregando}</span>
    </div>
  );
}
