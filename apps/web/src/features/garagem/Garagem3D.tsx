import { useEffect, useRef } from 'react';
import type { Garagem, Pintura } from './cena';
import styles from './GaragemPage.module.css';
import { idiomaAtual } from '../../shared/i18n/idioma';
import { quandoO3dPuderComecar } from './suporte';

interface Props extends Pintura {
  numero: number;
  asaAberta: boolean;
  girando: boolean;
  /** Chamada quando o aparelho não aguenta o carro girando sozinho. */
  aoFicarParado?: () => void;
}

export function Garagem3D({
  cor,
  corSecundaria,
  numero,
  redesenho,
  modelo,
  asaAberta,
  girando,
  aoFicarParado,
}: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const estado = useRef({ asaAberta, girando, redesenho, aoFicarParado });

  useEffect(() => {
    estado.current = { asaAberta, girando, redesenho, aoFicarParado };
  });

  useEffect(() => {
    let cancelado = false;

    void quandoO3dPuderComecar()
      .then(() => import('./cena'))
      .then(({ montarGaragem }) => {
        if (cancelado || !recipiente.current) {
          return;
        }

        garagem.current = montarGaragem(
          recipiente.current,
          { cor, corSecundaria, numero, redesenho: estado.current.redesenho, modelo },
          { girando: estado.current.girando },
        );
        garagem.current.abrirAsa(estado.current.asaAberta);

        if (garagem.current.leve) {
          estado.current.aoFicarParado?.();
        }
      });

    return () => {
      cancelado = true;
      garagem.current?.destruir();
      garagem.current = null;
    };
    // A pintura desenhada muda junto com a equipe e o número; o texto do
    // lado direito basta para saber se ela mudou.
  }, [cor, corSecundaria, numero, redesenho?.direita, modelo]);

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
