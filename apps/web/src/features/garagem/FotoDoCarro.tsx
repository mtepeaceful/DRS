import { idiomaAtual } from '../../shared/i18n/idioma';
import styles from './GaragemPage.module.css';
import type { ModeloDoSite } from './modelos';

/**
 * O carro visto de lado, para navegadores sem 3D. A imagem foi tirada do
 * mesmo modelo que aparece na garagem.
 */
export function FotoDoCarro({ modelo, numero }: { modelo: ModeloDoSite; numero?: number }) {
  const ingles = idiomaAtual() === 'en';
  const alt =
    numero === undefined
      ? ingles
        ? 'Car seen from the side'
        : 'Carro visto de lado'
      : ingles
        ? `Car number ${numero} seen from the side`
        : `Carro número ${numero} visto de lado`;

  return (
    <img
      className={styles.ilustracao}
      src={`/modelos/${modelo}/lado.webp`}
      width={1200}
      height={360}
      alt={alt}
      decoding="async"
    />
  );
}
