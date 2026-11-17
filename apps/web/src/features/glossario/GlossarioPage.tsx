import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { localeDo, useIdioma, useTextos } from '../../shared/i18n/idioma';
import { semAcento } from '../../shared/lib/texto';
import { useRolarAteAncora } from '../../shared/lib/useRolarAteAncora';
import chip from '../../shared/ui/chip.module.css';
import styles from './GlossarioPage.module.css';
import { categoriasNoIdioma, termosNoIdioma } from './noIdioma';
import type { Categoria } from './termos';

const TEXTOS = {
  pt: {
    titulo: 'Glossário da F1',
    resumo:
      'Os termos e as regras da Fórmula 1 explicados em português, do undercut ao parc fermé.',
    buscar: 'Buscar termo',
    exemplo: 'Buscar termo, como safety car ou pole',
    categorias: 'Categorias',
    contagem: (n: number) => `${n} ${n === 1 ? 'termo' : 'termos'}`,
    vejaTambem: 'Veja também:',
  },
  en: {
    titulo: 'F1 glossary',
    resumo: 'Formula 1 terms and rules explained in plain words, from the undercut to parc fermé.',
    buscar: 'Search for a term',
    exemplo: 'Search for a term, like safety car or pole',
    categorias: 'Categories',
    contagem: (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`,
    vejaTambem: 'See also:',
  },
};

export function GlossarioPage() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const termo = semAcento(useDeferredValue(busca).trim());
  const idioma = useIdioma();
  const t = useTextos(TEXTOS);
  const termos = termosNoIdioma();
  const categorias = categoriasNoIdioma();
  const porId = new Map(termos.map((item) => [item.id, item]));
  const emOrdem = termos.toSorted((a, b) => a.nome.localeCompare(b.nome, localeDo(idioma)));

  useRolarAteAncora();

  const encontrados = emOrdem.filter(
    (item) =>
      (!categoria || item.categoria === categoria) &&
      semAcento(`${item.nome} ${item.tambem ?? ''} ${item.definicao}`).includes(termo),
  );

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo}</p>
      </header>

      <div className={styles.filtros}>
        <label htmlFor="busca-no-glossario" className="apenas-leitor">
          {t.buscar}
        </label>
        <input
          id="busca-no-glossario"
          type="search"
          className={styles.busca}
          placeholder={t.exemplo}
          maxLength={60}
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <div className={styles.categorias} role="group" aria-label={t.categorias}>
          {(Object.entries(categorias) as [Categoria, string][]).map(([chave, nome]) => (
            <button
              key={chave}
              type="button"
              className={categoria === chave ? chip.chipAtivo : chip.chip}
              aria-pressed={categoria === chave}
              onClick={() => setCategoria((atual) => (atual === chave ? null : chave))}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.contagem} aria-live="polite">
        {t.contagem(encontrados.length)}
      </p>

      <dl className={styles.termos}>
        {encontrados.map((item) => (
          <div key={item.id} id={item.id} tabIndex={-1} className={styles.termo}>
            <dt className={styles.nome}>
              {item.nome}
              {item.tambem && <span className={styles.tambem}>{item.tambem}</span>}
            </dt>
            <dd className={styles.corpo}>
              <span className={styles.selo}>{categorias[item.categoria]}</span>
              <p className={styles.definicao}>{item.definicao}</p>
              {item.relacionados.length > 0 && (
                <p className={styles.relacionados}>
                  {t.vejaTambem}{' '}
                  {item.relacionados.map((id, indice) => (
                    <span key={id}>
                      {indice > 0 && ', '}
                      <a href={`#${id}`}>{porId.get(id)?.nome ?? id}</a>
                    </span>
                  ))}
                </p>
              )}
              {item.noSite && (
                <Link to={item.noSite.para} className={styles.noSite}>
                  {item.noSite.texto} →
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
