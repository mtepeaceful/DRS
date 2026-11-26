import { carroDaEquipe } from '../garagem/modelos';
import styles from './SilhuetaDoCarro.module.css';

interface Props {
  /** O nome da equipe escolhe o carro. */
  nome: string;
  acesa?: boolean;
  className?: string;
}

/**
 * Um F1 de 2026 visto de lado: a foto de lado do mesmo modelo que aparece na
 * garagem. Uma equipe sem carro próprio usa o carro de reserva.
 */
export function SilhuetaDoCarro({ nome, acesa = false, className }: Props) {
  const classe = className ? `${styles.carro} ${className}` : styles.carro;

  return (
    <img
      className={classe}
      src={`/modelos/${carroDaEquipe(nome)}/lado.webp`}
      width={1000}
      height={300}
      alt=""
      loading="lazy"
      decoding="async"
      data-acesa={acesa || undefined}
    />
  );
}
