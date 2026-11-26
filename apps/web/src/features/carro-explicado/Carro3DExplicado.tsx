import { useEffect, useRef } from 'react';
import type { Garagem } from '../garagem/cena';
import styles from './CarroExplicadoPage.module.css';
import { useTextos } from '../../shared/i18n/idioma';
import { PINTURAS, pinturaDoRedesenho } from '../garagem/pinturas';
import { PECAS, pecasNoIdioma } from './pecas';
import { quandoO3dPuderComecar } from '../garagem/suporte';

const TEXTOS = {
  pt: { rotulo: 'Carro de F1 em 3D. Arraste para girar e escolha uma peça para ver a explicação.' },
  en: { rotulo: 'F1 car in 3D. Drag to rotate and pick a part to see what it does.' },
};

// O carro do explicador usa a pintura da Ferrari do redesenho, com o número 16,
// no lugar de um carro vermelho genérico.
const FERRARI = PINTURAS.ferrari;
const PINTURA = {
  ...FERRARI,
  numero: 16,
  redesenho: pinturaDoRedesenho('Ferrari', FERRARI, 16),
};

interface Props {
  selecionada: string | null;
  aoSelecionar: (id: string) => void;
}

export function Carro3DExplicado({ selecionada, aoSelecionar }: Props) {
  const recipiente = useRef<HTMLDivElement>(null);
  const garagem = useRef<Garagem | null>(null);
  const marcadores = useRef(new Map<string, HTMLButtonElement>());
  const t = useTextos(TEXTOS);

  useEffect(() => {
    let cancelado = false;

    // Os marcadores andam junto com o carro: só são reposicionados quando o
    // 3D desenha um quadro novo, e não a cada quadro da tela.
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
    }

    void quandoO3dPuderComecar()
      .then(() => import('../garagem/cena'))
      .then(({ montarGaragem }) => {
        if (cancelado || !recipiente.current) {
          return;
        }

        garagem.current = montarGaragem(recipiente.current, PINTURA, {
          girando: false,
          aoDesenhar: posicionar,
        });
      });

    return () => {
      cancelado = true;
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
      <div ref={recipiente} className={styles.cena} role="img" aria-label={t.rotulo} />
      {pecasNoIdioma().map((peca, indice) => (
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
