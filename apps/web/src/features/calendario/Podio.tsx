import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { CORES_NEUTRAS } from './cores';
import styles from './Podio.module.css';

interface Degrau {
  posicao: number;
  nome: string;
  equipe: string;
}

export function Podio({ pilotos, className }: { pilotos: Degrau[]; className?: string }) {
  return (
    <ol className={className ? `${styles.podio} ${className}` : styles.podio}>
      {pilotos.map((piloto) => (
        <li key={piloto.posicao} className={styles[`degrau${piloto.posicao}`]}>
          <span className={styles.lugar}>{piloto.posicao}º</span>
          <span className={styles.nome}>{piloto.nome}</span>
          <SimboloDaEquipe nome={piloto.equipe} {...CORES_NEUTRAS} />
        </li>
      ))}
    </ol>
  );
}
