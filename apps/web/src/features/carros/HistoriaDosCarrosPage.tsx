import { Link } from 'react-router';
import { useTextos } from '../../shared/i18n/idioma';
import { useRolarAteAncora } from '../../shared/lib/useRolarAteAncora';
import { nomeDoTermo } from '../glossario/noIdioma';
import { erasNoIdioma } from './eras.en';
import styles from './HistoriaDosCarrosPage.module.css';

const TEXTOS = {
  pt: {
    titulo: 'História dos carros da F1',
    evolucao: 'A evolução dos carros',
    resumo:
      'Do Alfa Romeo de 1950 à aerodinâmica ativa de 2026: as eras da Fórmula 1, o que mudou em cada uma e os carros que marcaram época.',
    eras: 'Eras',
    oQueMudou: 'O que mudou',
    marcaram: 'Carros que marcaram',
    noGlossario: 'No glossário:',
  },
  en: {
    titulo: 'History of F1 cars',
    evolucao: 'How the cars evolved',
    resumo:
      'From the 1950 Alfa Romeo to the active aerodynamics of 2026: the eras of Formula 1, what changed in each one and the cars that defined them.',
    eras: 'Eras',
    oQueMudou: 'What changed',
    marcaram: 'Landmark cars',
    noGlossario: 'In the glossary:',
  },
};

export function HistoriaDosCarrosPage() {
  const t = useTextos(TEXTOS);
  const eras = erasNoIdioma();

  useRolarAteAncora();

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.evolucao}</h1>
        <p className={styles.resumo}>{t.resumo}</p>
        <nav aria-label={t.eras} className={styles.eras}>
          {eras.map((era) => (
            <a key={era.id} href={`#${era.id}`} className={styles.atalho}>
              <span className={styles.periodoCurto}>{era.periodo}</span>
              {era.nome}
            </a>
          ))}
        </nav>
      </header>

      <ol className={styles.linhaDoTempo}>
        {eras.map((era) => (
          <li key={era.id} id={era.id} tabIndex={-1} className={styles.era}>
            <span className={styles.periodo}>{era.periodo}</span>
            <h2 className={styles.nome}>{era.nome}</h2>
            <p className={styles.texto}>{era.resumo}</p>

            <h3 className={styles.subtitulo}>{t.oQueMudou}</h3>
            <ul className={styles.mudancas}>
              {era.mudancas.map((mudanca) => (
                <li key={mudanca}>{mudanca}</li>
              ))}
            </ul>

            {era.marcos.length > 0 && (
              <>
                <h3 className={styles.subtitulo}>{t.marcaram}</h3>
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
                {t.noGlossario}{' '}
                {era.termos.map((id, indice) => (
                  <span key={id}>
                    {indice > 0 && ', '}
                    <Link to={`/glossario#${id}`}>{nomeDoTermo(id) ?? id}</Link>
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
