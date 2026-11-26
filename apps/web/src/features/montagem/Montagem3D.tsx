import { useEffect, useRef } from 'react';
import type { Garagem, Pintura } from '../garagem/cena';
import styles from './MontagemPage.module.css';
import { quandoO3dPuderComecar } from '../garagem/suporte';

interface Props {
  pintura: Pintura;
  girando: boolean;
  descricao: string;
  /** Chamada quando o aparelho não aguenta o carro girando sozinho. */
  aoFicarParado?: () => void;
}

export function Montagem3D({ pintura, girando, descricao, aoFicarParado }: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const atual = useRef({ pintura, girando, aoFicarParado });

  useEffect(() => {
    atual.current = { pintura, girando, aoFicarParado };
  });

  useEffect(() => {
    let cancelado = false;

    void quandoO3dPuderComecar()
      .then(() => import('../garagem/cena'))
      .then(({ montarGaragem }) => {
        if (cancelado || !recipiente.current) {
          return;
        }

        garagem.current = montarGaragem(recipiente.current, atual.current.pintura, {
          girando: atual.current.girando,
        });

        if (garagem.current.leve) {
          atual.current.aoFicarParado?.();
        }
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
