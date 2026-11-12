import type { VerbeteDTO } from '@drs/contracts';
import styles from './FotoDoCommons.module.css';

interface Props {
  foto: NonNullable<VerbeteDTO['foto']>;
  descricao: string;
  className?: string | undefined;
}

function ehDesenho(endereco: string) {
  return /\.svg(\.png)?$/i.test(new URL(endereco).pathname);
}

export function FotoDoCommons({ foto, descricao, className }: Props) {
  const credito = [foto.autor, foto.licenca].filter(Boolean).join(' · ');
  const desenho = ehDesenho(foto.url);

  return (
    <figure className={className ? `${styles.foto} ${className}` : styles.foto}>
      <img
        src={foto.url}
        alt={descricao}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={desenho ? styles.desenho : styles.imagem}
      />
      <figcaption className={styles.credito}>
        <a href={foto.pagina} target="_blank" rel="noopener noreferrer">
          {desenho ? 'Imagem' : 'Foto'}
          {credito ? `: ${credito}` : ''}
          <span className="apenas-leitor"> (Wikimedia Commons, abre em nova aba)</span>
        </a>
      </figcaption>
    </figure>
  );
}
