import type { VerbeteDTO } from '@drs/contracts';
import styles from './FotoDoCommons.module.css';

interface Props {
  foto: NonNullable<VerbeteDTO['foto']>;
  descricao: string;
  className?: string | undefined;
}

export function FotoDoCommons({ foto, descricao, className }: Props) {
  const credito = [foto.autor, foto.licenca].filter(Boolean).join(' · ');

  return (
    <figure className={className ? `${styles.foto} ${className}` : styles.foto}>
      <img
        src={foto.url}
        alt={descricao}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={styles.imagem}
      />
      <figcaption className={styles.credito}>
        <a href={foto.pagina} target="_blank" rel="noopener noreferrer">
          Foto{credito ? `: ${credito}` : ''}
          <span className="apenas-leitor"> (Wikimedia Commons, abre em nova aba)</span>
        </a>
      </figcaption>
    </figure>
  );
}
