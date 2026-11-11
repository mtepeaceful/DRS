import type { ReactNode } from 'react';
import styles from './Aviso.module.css';

interface Props {
  titulo: string;
  tipo?: 'erro' | 'vazio';
  children?: ReactNode;
  acao?: ReactNode;
}

export function Aviso({ titulo, tipo = 'vazio', children, acao }: Props) {
  return (
    <div className={styles[tipo]} role={tipo === 'erro' ? 'alert' : undefined}>
      <h2 className={styles.titulo}>{titulo}</h2>
      {children && <p className={styles.texto}>{children}</p>}
      {acao}
    </div>
  );
}
