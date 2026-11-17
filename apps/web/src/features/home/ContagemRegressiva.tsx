import { useEffect, useState } from 'react';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './ContagemRegressiva.module.css';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const TEXTOS = {
  pt: {
    rotulos: ['dias', 'horas', 'min', 'seg'],
    comecou: 'A corrida já começou',
    faltam: 'Faltam',
  },
  en: {
    rotulos: ['days', 'hours', 'min', 'sec'],
    comecou: 'The race has started',
    faltam: 'Starts in',
  },
};

function partes(restante: number, rotulos: string[]) {
  return [
    Math.floor(restante / DIA),
    Math.floor((restante % DIA) / HORA),
    Math.floor((restante % HORA) / MINUTO),
    Math.floor((restante % MINUTO) / SEGUNDO),
  ].map((valor, indice) => ({ valor, rotulo: rotulos[indice] ?? '' }));
}

export function ContagemRegressiva({ ate }: { ate: string }) {
  const alvo = Date.parse(ate);
  const [agora, setAgora] = useState(() => Date.now());
  const t = useTextos(TEXTOS);

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), SEGUNDO);

    return () => clearInterval(relogio);
  }, []);

  const restante = alvo - agora;

  if (restante <= 0) {
    return <p className={styles.agora}>{t.comecou}</p>;
  }

  const descricao = partes(restante, t.rotulos)
    .slice(0, 3)
    .map(({ valor, rotulo }) => `${valor} ${rotulo}`)
    .join(', ');

  return (
    <div className={styles.contagem} role="timer" aria-label={`${t.faltam} ${descricao}`}>
      {partes(restante, t.rotulos).map(({ valor, rotulo }) => (
        <div key={rotulo} className={styles.bloco} aria-hidden="true">
          <span className={styles.valor}>{String(valor).padStart(2, '0')}</span>
          <span className={styles.rotulo}>{rotulo}</span>
        </div>
      ))}
    </div>
  );
}
