import { useEffect, useState } from 'react';
import styles from './ContagemRegressiva.module.css';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

function partes(restante: number) {
  return [
    { valor: Math.floor(restante / DIA), rotulo: 'dias' },
    { valor: Math.floor((restante % DIA) / HORA), rotulo: 'horas' },
    { valor: Math.floor((restante % HORA) / MINUTO), rotulo: 'min' },
    { valor: Math.floor((restante % MINUTO) / SEGUNDO), rotulo: 'seg' },
  ];
}

export function ContagemRegressiva({ ate }: { ate: string }) {
  const alvo = Date.parse(ate);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), SEGUNDO);

    return () => clearInterval(relogio);
  }, []);

  const restante = alvo - agora;

  if (restante <= 0) {
    return <p className={styles.agora}>A corrida já começou</p>;
  }

  const descricao = partes(restante)
    .slice(0, 3)
    .map(({ valor, rotulo }) => `${valor} ${rotulo}`)
    .join(', ');

  return (
    <div className={styles.contagem} role="timer" aria-label={`Faltam ${descricao}`}>
      {partes(restante).map(({ valor, rotulo }) => (
        <div key={rotulo} className={styles.bloco} aria-hidden="true">
          <span className={styles.valor}>{String(valor).padStart(2, '0')}</span>
          <span className={styles.rotulo}>{rotulo}</span>
        </div>
      ))}
    </div>
  );
}
