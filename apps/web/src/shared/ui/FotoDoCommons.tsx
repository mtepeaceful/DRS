import type { VerbeteDTO } from '@drs/contracts';
import { type ReactNode, useState } from 'react';
import { useTextos } from '../i18n/idioma';
import styles from './FotoDoCommons.module.css';

const TEXTOS = { pt: { imagem: 'Imagem', foto: 'Foto' }, en: { imagem: 'Image', foto: 'Photo' } };

interface Props {
  foto: NonNullable<VerbeteDTO['foto']>;
  descricao: string;
  className?: string | undefined;
  substituto?: ReactNode;
}

function ehDesenho(endereco: string) {
  return /\.svg(\.png)?$/i.test(new URL(endereco).pathname);
}

export function FotoDoCommons({ foto, descricao, className, substituto }: Props) {
  const [quebrada, setQuebrada] = useState<string | null>(null);
  const credito = [foto.autor, foto.licenca].filter(Boolean).join(' · ');
  const desenho = ehDesenho(foto.url);
  const t = useTextos(TEXTOS);

  if (quebrada === foto.url) {
    return substituto ?? null;
  }

  return (
    <figure className={className ? `${styles.foto} ${className}` : styles.foto}>
      <img
        src={foto.url}
        alt={descricao}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setQuebrada(foto.url)}
        className={desenho ? styles.desenho : styles.imagem}
      />
      <figcaption className={styles.credito}>
        <a href={foto.pagina} target="_blank" rel="noopener noreferrer">
          {desenho ? t.imagem : t.foto}
          {credito ? `: ${credito}` : ''}
          <span className="apenas-leitor"> (Wikimedia Commons, abre em nova aba)</span>
        </a>
      </figcaption>
    </figure>
  );
}
