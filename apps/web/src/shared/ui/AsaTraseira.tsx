import styles from './AsaTraseira.module.css';

export function AsaTraseira({ aberta }: { aberta: boolean }) {
  return (
    <svg
      className={styles.asa}
      data-aberta={aberta || undefined}
      viewBox="0 0 40 24"
      aria-hidden="true"
    >
      <rect className={styles.atuador} x="18.5" y="4" width="3" height="11" rx="1" />
      <rect className={styles.flap} x="5" y="6" width="30" height="7" rx="1" />
      <rect className={styles.plano} x="5" y="14" width="30" height="5" rx="1" />
      <rect className={styles.placa} x="1" y="2" width="3.5" height="20" rx="1" />
      <rect className={styles.placa} x="35.5" y="2" width="3.5" height="20" rx="1" />
    </svg>
  );
}
