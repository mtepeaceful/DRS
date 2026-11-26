import { useId, useMemo } from 'react';
import type { CoresDaEquipe } from '../../shared/lib/equipe';
import { modeloDaEquipe } from '../garagem/modelos';
import { desenharCarro, VIEWBOX } from './carro/desenho';
import { pinturaDaEquipe } from './carro/pinturas';
import styles from './SilhuetaDoCarro.module.css';

interface Props extends CoresDaEquipe {
  /** O nome da equipe escolhe a pintura; sem pintura própria, o carro usa as duas cores. */
  nome: string;
  /** O número que vai no bico e na tampa do motor. */
  numero?: number | undefined;
  acesa?: boolean;
  className?: string;
}

/**
 * Um F1 de 2026 visto de lado, com a pintura e os patrocínios de cada equipe.
 * Quem tem carro baixado do Sketchfab mostra uma foto de lado dele (tirada do
 * mesmo modelo da garagem); as outras equipes usam o desenho em SVG.
 */
export function SilhuetaDoCarro({
  nome,
  numero,
  cor,
  corSecundaria,
  acesa = false,
  className,
}: Props) {
  const sufixo = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const modelo = modeloDaEquipe(nome);
  const desenho = useMemo(
    () =>
      modelo ? '' : desenharCarro(pinturaDaEquipe(nome, { cor, corSecundaria }), numero, sufixo),
    [modelo, nome, numero, cor, corSecundaria, sufixo],
  );
  const classe = className ? `${styles.carro} ${className}` : styles.carro;

  if (modelo) {
    return (
      <img
        className={classe}
        src={`/modelos/${modelo}/lado.webp`}
        width={1000}
        height={300}
        alt=""
        loading="lazy"
        decoding="async"
        data-acesa={acesa || undefined}
      />
    );
  }

  return (
    <svg
      className={classe}
      viewBox={VIEWBOX}
      data-acesa={acesa || undefined}
      aria-hidden="true"
      focusable="false"
      // O desenho é montado só com dados fixos do próprio site e o número do piloto.
      dangerouslySetInnerHTML={{ __html: desenho }}
    />
  );
}
