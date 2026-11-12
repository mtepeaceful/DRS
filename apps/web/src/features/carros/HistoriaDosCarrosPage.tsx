import { Link } from 'react-router';
import { useRolarAteAncora } from '../../shared/lib/useRolarAteAncora';
import { TERMOS } from '../glossario/termos';
import { ERAS } from './eras';
import styles from './HistoriaDosCarrosPage.module.css';

const NOME_DO_TERMO = new Map(TERMOS.map((termo) => [termo.id, termo.nome]));

export function HistoriaDosCarrosPage() {
  useRolarAteAncora();

  return (
    <>
      <title>História dos carros da F1 · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>A evolução dos carros</h1>
        <p className={styles.resumo}>
          Do Alfa Romeo de 1950 à aerodinâmica ativa de 2026: as eras da Fórmula 1, o que mudou em
          cada uma e os carros que marcaram época.
        </p>
        <nav aria-label="Eras" className={styles.eras}>
          {ERAS.map((era) => (
            <a key={era.id} href={`#${era.id}`} className={styles.atalho}>
              <span className={styles.periodoCurto}>{era.periodo}</span>
              {era.nome}
            </a>
          ))}
        </nav>
      </header>

      <ol className={styles.linhaDoTempo}>
        {ERAS.map((era) => (
          <li key={era.id} id={era.id} tabIndex={-1} className={styles.era}>
            <span className={styles.periodo}>{era.periodo}</span>
            <h2 className={styles.nome}>{era.nome}</h2>
            <p className={styles.texto}>{era.resumo}</p>

            <h3 className={styles.subtitulo}>O que mudou</h3>
            <ul className={styles.mudancas}>
              {era.mudancas.map((mudanca) => (
                <li key={mudanca}>{mudanca}</li>
              ))}
            </ul>

            {era.marcos.length > 0 && (
              <>
                <h3 className={styles.subtitulo}>Carros que marcaram</h3>
                <ul className={styles.marcos}>
                  {era.marcos.map((marco) => (
                    <li key={marco.carro} className={styles.marco}>
                      <span className={styles.ano}>
                        <Link to={`/historia/${marco.ano}`}>{marco.ano}</Link>
                      </span>
                      <strong className={styles.carro}>{marco.carro}</strong>
                      <span className={styles.textoDoMarco}>{marco.texto}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {era.termos.length > 0 && (
              <p className={styles.termos}>
                No glossário:{' '}
                {era.termos.map((id, indice) => (
                  <span key={id}>
                    {indice > 0 && ', '}
                    <Link to={`/glossario#${id}`}>{NOME_DO_TERMO.get(id) ?? id}</Link>
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
