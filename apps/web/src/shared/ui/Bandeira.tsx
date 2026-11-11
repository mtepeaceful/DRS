import { bandeiraDoPais } from '../lib/paises';
import styles from './Bandeira.module.css';

export function Bandeira({ pais }: { pais: string }) {
  const url = bandeiraDoPais(pais);

  if (!url) {
    return null;
  }

  return (
    <img
      src={url}
      alt=""
      width={24}
      height={16}
      loading="lazy"
      decoding="async"
      className={styles.bandeira}
    />
  );
}
