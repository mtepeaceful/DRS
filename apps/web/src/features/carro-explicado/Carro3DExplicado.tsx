import { useEffect, useRef } from 'react';
import type { Garagem } from '../garagem/cena';
import styles from './CarroExplicadoPage.module.css';
import { PECAS } from './pecas';

const PINTURA = { cor: '#d81500', corSecundaria: '#f1f2f5', numero: 1 };

interface Props {
  selecionada: string | null;
  aoSelecionar: (id: string) => void;
}

export function Carro3DExplicado({ selecionada, aoSelecionar }: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const marcadores = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    let cancelado = false;
    let quadro = 0;

    function posicionar() {
      const atual = garagem.current;

      if (atual) {
        for (const peca of PECAS) {
          const marcador = marcadores.current.get(peca.id);
          const { x, y, visivel } = atual.projetar(peca.ponto);

          if (marcador) {
            marcador.style.transform = `translate(${x}px, ${y}px)`;
            marcador.hidden = !visivel;
          }
        }
      }

      quadro = requestAnimationFrame(posicionar);
    }

    void import('../garagem/cena').then(({ montarGaragem }) => {
      if (cancelado || !recipiente.current) {
        return;
      }

      garagem.current = montarGaragem(recipiente.current, PINTURA, { girando: false });
      quadro = requestAnimationFrame(posicionar);
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(quadro);
      garagem.current?.destruir();
      garagem.current = null;
    };
  }, []);

  useEffect(() => {
    const peca = PECAS.find((candidata) => candidata.id === selecionada);
    garagem.current?.focar(peca?.ponto ?? null);
    garagem.current?.abrirAsa(selecionada === 'asa-traseira');
  }, [selecionada]);

  return (
    <div className={styles.palco}>
      <div
        ref={recipiente}
        className={styles.cena}
        role="img"
        aria-label="Carro de F1 em 3D. Arraste para girar e escolha uma peça para ver a explicação."
      />
      {PECAS.map((peca, indice) => (
        <button
          key={peca.id}
          ref={(elemento) => {
            if (elemento) {
              marcadores.current.set(peca.id, elemento);
            } else {
              marcadores.current.delete(peca.id);
            }
          }}
          type="button"
          className={peca.id === selecionada ? styles.marcadorAtivo : styles.marcador}
          aria-label={peca.nome}
          aria-pressed={peca.id === selecionada}
          onClick={() => aoSelecionar(peca.id)}
        >
          {indice + 1}
        </button>
      ))}
    </div>
  );
}
