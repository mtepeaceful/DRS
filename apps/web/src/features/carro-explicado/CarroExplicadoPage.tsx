import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { temWebgl } from '../garagem/suporte';
import { TERMOS } from '../glossario/termos';
import { Carro3DExplicado } from './Carro3DExplicado';
import styles from './CarroExplicadoPage.module.css';
import { PECAS } from './pecas';

const NOME_DO_TERMO = new Map(TERMOS.map((termo) => [termo.id, termo.nome]));

export function CarroExplicadoPage() {
  const [parametros, setParametros] = useSearchParams();
  const [com3d] = useState(temWebgl);
  const idDaPeca = parametros.get('peca');
  const peca = PECAS.find((candidata) => candidata.id === idDaPeca) ?? null;

  function selecionar(id: string) {
    setParametros(id === peca?.id ? {} : { peca: id }, { replace: true, preventScrollReset: true });
  }

  return (
    <>
      <title>O carro de F1 explicado · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>O carro por dentro</h1>
        <p className={styles.resumo}>
          Escolha uma peça para ver o que ela faz. Arraste o carro para girar e use a roda do mouse
          ou o gesto de pinça para aproximar.
        </p>
      </header>

      <div className={styles.layout}>
        {com3d ? (
          <Carro3DExplicado selecionada={peca?.id ?? null} aoSelecionar={selecionar} />
        ) : (
          <p className={styles.sem3d}>
            Este navegador não consegue mostrar 3D, mas todas as peças estão explicadas na lista.
          </p>
        )}

        <div className={styles.lateral}>
          <ol className={styles.pecas} aria-label="Peças do carro">
            {PECAS.map((item, indice) => (
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

          <section className={styles.detalhe} aria-live="polite" aria-label="Explicação da peça">
            {peca ? (
              <>
                <h2 className={styles.nomeDaPeca}>{peca.nome}</h2>
                <p className={styles.texto}>{peca.texto}</p>
                {peca.termos.length > 0 && (
                  <p className={styles.termos}>
                    No glossário:{' '}
                    {peca.termos.map((id, indice) => (
                      <span key={id}>
                        {indice > 0 && ', '}
                        <Link to={`/glossario#${id}`}>{NOME_DO_TERMO.get(id) ?? id}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <p className={styles.texto}>
                Toque num número no carro ou numa peça da lista para ver a explicação.
              </p>
            )}
          </section>

          <Link to="/historia/carros" className={styles.atalho}>
            Como os carros mudaram desde 1950 →
          </Link>
        </div>
      </div>
    </>
  );
}
