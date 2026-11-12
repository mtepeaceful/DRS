import styles from './AvisoDeEspera.module.css';

export function AvisoDeEspera({ ativo }: { ativo: boolean }) {
  return (
    <div className={styles.lugar} role="status">
      {ativo && (
        <p className={styles.aviso}>
          Buscando os dados. Se o site ficou um tempo parado, o servidor leva até um minuto para
          acordar.
        </p>
      )}
    </div>
  );
}
