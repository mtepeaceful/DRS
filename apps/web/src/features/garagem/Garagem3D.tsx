import { useEffect, useRef } from 'react';
import type { Garagem, Pintura } from './cena';
import styles from './GaragemPage.module.css';
import { idiomaAtual } from '../../shared/i18n/idioma';

interface Props extends Pintura {
  numero: number;
  asaAberta: boolean;
  girando: boolean;
}

export function Garagem3D({ cor, corSecundaria, numero, asaAberta, girando }: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const estado = useRef({ asaAberta, girando });

  useEffect(() => {
    estado.current = { asaAberta, girando };
  });

  useEffect(() => {
    let cancelado = false;

    void import('./cena').then(({ montarGaragem }) => {
      if (cancelado || !recipiente.current) {
        return;
      }

      garagem.current = montarGaragem(
        recipiente.current,
        { cor, corSecundaria, numero },
        { girando: estado.current.girando },
      );
      garagem.current.abrirAsa(estado.current.asaAberta);
    });

    return () => {
      cancelado = true;
      garagem.current?.destruir();
      garagem.current = null;
    };
  }, [cor, corSecundaria, numero]);

  useEffect(() => {
    garagem.current?.abrirAsa(asaAberta);
  }, [asaAberta]);

  useEffect(() => {
    garagem.current?.girar(girando);
  }, [girando]);

  return (
    <div
      ref={recipiente}
      className={styles.palco}
      role="img"
      aria-label={
        idiomaAtual() === 'en'
          ? `Car number ${numero} in 3D. Drag to rotate.`
          : `Carro número ${numero} em 3D. Arraste para girar.`
      }
    />
  );
}
