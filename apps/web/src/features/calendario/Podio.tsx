import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { CORES_NEUTRAS } from './cores';
import { useIdioma } from '../../shared/i18n/idioma';
import styles from './Podio.module.css';

const SUFIXOS_EM_INGLES = ['st', 'nd', 'rd'];

interface Degrau {
  posicao: number;
  nome: string;
  equipe: string;
}

export function Podio({ pilotos, className }: { pilotos: Degrau[]; className?: string }) {
  const idioma = useIdioma();

  return (
    <ol className={className ? `${styles.podio} ${className}` : styles.podio}>
      {pilotos.map((piloto) => (
        <li key={piloto.posicao} className={styles[`degrau${piloto.posicao}`]}>
          <span className={styles.lugar}>
            {piloto.posicao}
            {idioma === 'en' ? (SUFIXOS_EM_INGLES[piloto.posicao - 1] ?? 'th') : 'º'}
          </span>
          <span className={styles.nome}>{piloto.nome}</span>
          <SimboloDaEquipe nome={piloto.equipe} {...CORES_NEUTRAS} />
        </li>
      ))}
    </ol>
  );
}
