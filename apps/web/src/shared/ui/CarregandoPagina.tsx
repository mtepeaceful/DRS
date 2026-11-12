import { AsaTraseira } from './AsaTraseira';
import styles from './CarregandoPagina.module.css';

export function CarregandoPagina() {
  return (
    <div className={styles.carregando} role="status">
      <AsaTraseira aberta />
      <span className="apenas-leitor">Carregando o DRS…</span>
    </div>
  );
}
