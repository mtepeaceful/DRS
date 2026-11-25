import type { CSSProperties } from 'react';
import type { CoresDaEquipe } from '../../shared/lib/equipe';
import styles from './SilhuetaDoCarro.module.css';

/** O contorno de cima do carro, do bico à asa traseira: é a linha que acende. */
const CONTORNO =
  'M24 140C60 134 140 116 230 106L252 104L298 102C310 92 318 80 334 78L350 78C362 80 372 88 384 94C430 102 490 108 548 114L566 118';

interface Props extends CoresDaEquipe {
  /** Apagada, o carro é só a silhueta escura; acesa, ganha a pintura da equipe. */
  acesa?: boolean;
  className?: string;
}

/**
 * Um carro de F1 visto de lado, desenhado para o DRS. É um desenho só,
 * recolorido com as cores de cada equipe, e não depende de imagem nenhuma.
 */
export function SilhuetaDoCarro({ cor, corSecundaria, acesa = false, className }: Props) {
  const estilo = { '--cor-carro': cor, '--cor-carro-secundaria': corSecundaria } as CSSProperties;

  return (
    <svg
      className={className ? `${styles.carro} ${className}` : styles.carro}
      style={estilo}
      viewBox="0 0 620 168"
      data-acesa={acesa || undefined}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className={styles.sombraNoChao} cx="300" cy="159" rx="292" ry="6" />

      <path className={styles.mecanica} d="M66 145L522 143L522 151L66 151Z" />
      <path
        className={styles.suspensao}
        d="M150 112L122 124M168 140L122 124M470 112L500 124M474 140L500 124"
      />

      <path className={styles.pintura} d="M556 62L598 60L598 128L562 130Z" />
      <path className={styles.secundaria} d="M544 58L604 54L606 66L546 70Z" />
      <path className={styles.secundaria} d="M558 112L600 110L600 117L558 119Z" />

      <path className={styles.carroceria} d={`${CONTORNO}L566 138L520 144L160 146L70 144Z`} />
      <path
        className={styles.sombreado}
        d="M292 112C340 108 400 108 444 114C468 120 476 132 468 141L292 143Z"
      />
      <path className={styles.sombreado} d="M30 140L566 130L566 138L520 144L160 146L70 144Z" />
      <path
        className={styles.secundaria}
        d="M60 136C130 122 200 112 290 104L290 109C200 117 130 128 64 141Z"
      />
      <path
        className={styles.secundaria}
        d="M384 100C430 107 490 113 548 119L548 125C490 120 430 114 384 107Z"
      />
      <path className={styles.entrada} d="M292 112L302 111L302 130L292 131Z" />
      <path
        className={styles.brilho}
        d="M70 133C130 120 190 111 250 105M338 81L350 81C360 83 368 89 378 95"
      />

      <circle className={styles.capacete} cx="282" cy="95" r="9" />
      <path className={styles.halo} d="M252 103C262 87 286 83 306 92M262 101L268 90" />

      <path className={styles.pintura} d="M10 147L112 147L112 155L10 155Z" />
      <path className={styles.secundaria} d="M18 139L100 140L100 144L18 144Z" />
      <path className={styles.secundaria} d="M8 126L30 128L34 155L8 155Z" />

      <g>
        <circle className={styles.pneu} cx="122" cy="124" r="34" />
        <circle className={styles.faixa} cx="122" cy="124" r="25" />
        <circle className={styles.aro} cx="122" cy="124" r="18" />
      </g>
      <g>
        <circle className={styles.pneu} cx="500" cy="124" r="35" />
        <circle className={styles.faixa} cx="500" cy="124" r="26" />
        <circle className={styles.aro} cx="500" cy="124" r="18.5" />
      </g>

      <path className={styles.linha} d={CONTORNO} pathLength={1} />
    </svg>
  );
}
