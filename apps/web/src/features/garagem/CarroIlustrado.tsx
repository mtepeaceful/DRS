import type { Pintura } from './cena';
import styles from './GaragemPage.module.css';

export function CarroIlustrado({
  cor,
  corSecundaria,
  numero,
  asaAberta,
}: Pintura & { asaAberta: boolean }) {
  return (
    <svg
      className={styles.ilustracao}
      viewBox="0 0 560 220"
      role="img"
      aria-label={`Carro número ${numero} visto de lado`}
    >
      <ellipse cx="280" cy="196" rx="250" ry="10" fill="#000" opacity="0.45" />
      <path
        d="M30 150 L30 132 L110 128 L210 104 L260 104 L290 74 L330 58 L360 74 L470 130 L500 140 L500 158 Z"
        fill={cor}
      />
      <path d="M20 160 L520 160 L520 168 L20 168 Z" fill="#1c1c22" />
      <path d="M24 152 L84 152 L84 162 L24 162 Z" fill={corSecundaria} />
      <g
        style={{
          transform: `rotate(${asaAberta ? -22 : 0}deg)`,
          transformOrigin: '470px 76px',
          transformBox: 'view-box',
        }}
      >
        <path d="M452 74 L500 70 L502 80 L454 84 Z" fill={corSecundaria} />
      </g>
      <path d="M458 88 L506 86 L506 100 L458 102 Z" fill={cor} />
      <path d="M498 70 L508 70 L508 140 L498 140 Z" fill={cor} />
      <circle cx="248" cy="96" r="16" fill={corSecundaria} />
      <path d="M244 92 L262 90 L262 100 L246 102 Z" fill="#0b0b0f" />
      <path d="M218 92 Q246 70 280 88" fill="none" stroke="#1c1c22" strokeWidth="6" />
      <text
        x="380"
        y="122"
        fill={corSecundaria}
        fontSize="34"
        fontWeight="800"
        fontFamily="Segoe UI, system-ui, sans-serif"
        textAnchor="middle"
      >
        {numero}
      </text>
      {[130, 420].map((x) => (
        <g key={x}>
          <circle cx={x} cy="160" r="34" fill="#111114" />
          <circle cx={x} cy="160" r="19" fill={corSecundaria} />
          <circle cx={x} cy="160" r="6" fill="#111114" />
        </g>
      ))}
    </svg>
  );
}
