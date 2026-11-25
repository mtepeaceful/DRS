import { useEffect, useRef } from 'react';
import type { Garagem, Pintura } from '../garagem/cena';
import styles from './MontagemPage.module.css';

interface Props {
  pintura: Pintura;
  girando: boolean;
  descricao: string;
}

export function Montagem3D({ pintura, girando, descricao }: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const atual = useRef({ pintura, girando });

  useEffect(() => {
    atual.current = { pintura, girando };
  });

  useEffect(() => {
    let cancelado = false;

    void import('../garagem/cena').then(({ montarGaragem }) => {
      if (cancelado || !recipiente.current) {
        return;
      }

      garagem.current = montarGaragem(recipiente.current, atual.current.pintura, {
        girando: atual.current.girando,
      });
    });

    return () => {
      cancelado = true;
      garagem.current?.destruir();
      garagem.current = null;
    };
  }, []);

  useEffect(() => {
    garagem.current?.pintar(pintura);
  }, [pintura]);

  useEffect(() => {
    garagem.current?.girar(girando);
  }, [girando]);

  return <div ref={recipiente} className={styles.palco} role="img" aria-label={descricao} />;
}
