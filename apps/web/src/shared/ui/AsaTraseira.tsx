import { useId } from 'react';
import styles from './AsaTraseira.module.css';

function Perseguidor() {
  return (
    <g className={styles.perseguidor}>
      <path className={styles.pneuTraseiro} d="M-12.4-5.4h3.6v5.2h-3.6ZM8.8-5.4h3.6v5.2H8.8Z" />
      <path className={styles.aerofolio} d="M-5.4-8.8h10.8v1.2H-5.4Z" />
      <path className={styles.santoAntonio} d="M-.7-8.2h1.4v2H-.7Z" />
      <path className={styles.carroceria} d="M-6.4-2.2q.8-3 4-3.4h4.8q3.2.4 4 3.4Z" />
      <circle className={styles.capacete} cx="0" cy="-5.9" r="1.1" />
      <path className={styles.halo} d="M-2-5.2Q0-7.8 2-5.2" />
      <path className={styles.carroceria} d="M-1.3-1.4-.8-3.6H.8l.5 2.2Z" />
      <path className={styles.pneu} d="M-9.6-4.4h3.2V0h-3.2ZM6.4-4.4h3.2V0H6.4Z" />
      <path className={styles.asaDianteira} d="M-10.6-1.5h21.2v.9h-21.2Z" />
      <path className={styles.aerofolio} d="M-10.8-2.6h.9v2h-.9ZM9.9-2.6h.9v2h-.9Z" />
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
        <Perseguidor />
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
