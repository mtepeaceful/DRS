import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTextos } from '../../shared/i18n/idioma';
import { temWebgl } from '../garagem/suporte';
import { nomeDoTermo } from '../glossario/noIdioma';
import { Carro3DExplicado } from './Carro3DExplicado';
import styles from './CarroExplicadoPage.module.css';
import { pecasNoIdioma } from './pecas';

const TEXTOS = {
  pt: {
    titulo: 'O carro de F1 explicado',
    porDentro: 'O carro por dentro',
    resumo:
      'Escolha uma peça para ver o que ela faz. Arraste o carro para girar e use a roda do mouse ou o gesto de pinça para aproximar.',
    sem3d: 'Este navegador não consegue mostrar 3D, mas todas as peças estão explicadas na lista.',
    pecas: 'Peças do carro',
    explicacao: 'Explicação da peça',
    noGlossario: 'No glossário:',
    toque: 'Toque num número no carro ou numa peça da lista para ver a explicação.',
    historia: 'Como os carros mudaram desde 1950 →',
  },
  en: {
    titulo: 'The F1 car explained',
    porDentro: 'Inside the car',
    resumo:
      'Pick a part to see what it does. Drag the car to rotate it and use the mouse wheel or pinch to zoom.',
    sem3d: 'This browser cannot show 3D, but every part is explained in the list.',
    pecas: 'Car parts',
    explicacao: 'What the part does',
    noGlossario: 'In the glossary:',
    toque: 'Tap a number on the car or a part in the list to see what it does.',
    historia: 'How the cars changed since 1950 →',
  },
};

export function CarroExplicadoPage() {
  const [parametros, setParametros] = useSearchParams();
  const [com3d] = useState(temWebgl);
  const t = useTextos(TEXTOS);
  const pecas = pecasNoIdioma();
  const idDaPeca = parametros.get('peca');
  const peca = pecas.find((candidata) => candidata.id === idDaPeca) ?? null;

  function selecionar(id: string) {
    setParametros(id === peca?.id ? {} : { peca: id }, { replace: true, preventScrollReset: true });
  }

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.porDentro}</h1>
        <p className={styles.resumo}>{t.resumo}</p>
      </header>

      <div className={styles.layout}>
        {com3d ? (
          <Carro3DExplicado selecionada={peca?.id ?? null} aoSelecionar={selecionar} />
        ) : (
          <p className={styles.sem3d}>{t.sem3d}</p>
        )}

        <div className={styles.lateral}>
          <ol className={styles.pecas} aria-label={t.pecas}>
            {pecas.map((item, indice) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === peca?.id ? styles.pecaAtiva : styles.peca}
                  aria-pressed={item.id === peca?.id}
                  onClick={() => selecionar(item.id)}
                >
                  <span className={styles.numero}>{indice + 1}</span>
                  {item.nome}
                </button>
              </li>
            ))}
          </ol>

          <section className={styles.detalhe} aria-live="polite" aria-label={t.explicacao}>
            {peca ? (
              <>
                <h2 className={styles.nomeDaPeca}>{peca.nome}</h2>
                <p className={styles.texto}>{peca.texto}</p>
                {peca.termos.length > 0 && (
                  <p className={styles.termos}>
                    {t.noGlossario}{' '}
                    {peca.termos.map((id, indice) => (
                      <span key={id}>
                        {indice > 0 && ', '}
                        <Link to={`/glossario#${id}`}>{nomeDoTermo(id) ?? id}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <p className={styles.texto}>{t.toque}</p>
            )}
          </section>

          <Link to="/historia/carros" className={styles.atalho}>
            {t.historia}
          </Link>
        </div>
      </div>
    </>
  );
}
