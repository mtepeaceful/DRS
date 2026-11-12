import { useId } from 'react';
import styles from './AsaTraseira.module.css';

function Carro({ className }: { className: string }) {
  return (
    <g className={className}>
      <path
        className={styles.carroceria}
        d="M2.4 4.4 9 3.8l2.8-1.3q3.2-1.4 6.2 0L20.3 4l8.6 1.1 1.6 1.2-28 .4Z"
      />
      <path className={styles.aerofolio} d="M0 .8h4v1.4H2.8v2.4H1.6V2.2H0Z" />
      <path className={styles.capacete} d="M13.6 2.6q1.6-1.6 3.2 0Z" />
      <circle className={styles.roda} cx="6" cy="6.2" r="2.1" />
      <circle className={styles.roda} cx="24.6" cy="6.4" r="1.9" />
    </g>
  );
}

export function AsaTraseira({ aberta }: { aberta: boolean }) {
  const id = useId();
  const vermelho = `${id}-vermelho`;
  const branco = `${id}-branco`;
  const carbono = `${id}-carbono`;
  const pista = `${id}-pista`;

  return (
    <svg
      className={styles.asa}
      data-aberta={aberta || undefined}
      viewBox="0 0 64 38"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={vermelho} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3b2b" />
          <stop offset="0.55" stopColor="#dc0000" />
          <stop offset="1" stopColor="#8f0000" />
        </linearGradient>
        <linearGradient id={branco} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9ccd4" />
        </linearGradient>
        <linearGradient id={carbono} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4b55" />
          <stop offset="1" stopColor="#1c1c22" />
        </linearGradient>
        <clipPath id={pista}>
          <rect x="2" y="0" width="60" height="38" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${pista})`}>
        <Carro className={styles.perseguidor} />
        <Carro className={styles.lider} />
      </g>

      <path className={styles.pilar} d="M30 27h4l-0.6 10h-2.8z" fill={`url(#${carbono})`} />

      <path
        className={styles.plano}
        d="M9 20.5Q32 25 55 20.5V26.5Q32 31.5 9 26.5Z"
        fill={`url(#${carbono})`}
      />

      <path className={styles.fenda} d="M10 18.2Q32 22.4 54 18.2" pathLength="100" />

      <g className={styles.flap}>
        <path d="M9 9.5Q32 13 55 9.5V18.5Q32 22.5 9 18.5Z" fill={`url(#${branco})`} />
        <path className={styles.gurney} d="M9 9.5Q32 13 55 9.5" />
      </g>

      <path
        className={styles.atuador}
        d="M29.5 6.5h5a1.5 1.5 0 0 1 1.5 1.5v6h-8V8a1.5 1.5 0 0 1 1.5-1.5Z"
      />

      <path d="M2 2h7.5l1 2.5V32l-2 4H2.8L2 35Z" fill={`url(#${vermelho})`} />
      <path d="M62 2h-7.5l-1 2.5V32l2 4h5.7L62 35Z" fill={`url(#${vermelho})`} />
      <path className={styles.frestas} d="M4 6h4.5M4 8.5h4.5M55.5 6H60M55.5 8.5H60" />
    </svg>
  );
}
