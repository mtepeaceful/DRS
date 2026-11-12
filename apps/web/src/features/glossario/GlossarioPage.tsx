import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { semAcento } from '../../shared/lib/texto';
import { useRolarAteAncora } from '../../shared/lib/useRolarAteAncora';
import chip from '../../shared/ui/chip.module.css';
import styles from './GlossarioPage.module.css';
import { CATEGORIAS, type Categoria, TERMOS } from './termos';

const POR_ID = new Map(TERMOS.map((termo) => [termo.id, termo]));
const EM_ORDEM = TERMOS.toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export function GlossarioPage() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const termo = semAcento(useDeferredValue(busca).trim());

  useRolarAteAncora();

  const encontrados = EM_ORDEM.filter(
    (item) =>
      (!categoria || item.categoria === categoria) &&
      semAcento(`${item.nome} ${item.tambem ?? ''} ${item.definicao}`).includes(termo),
  );

  return (
    <>
      <title>Glossário da F1 · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Glossário da F1</h1>
        <p className={styles.resumo}>
          Os termos e as regras da Fórmula 1 explicados em português, do undercut ao parc fermé.
        </p>
      </header>

      <div className={styles.filtros}>
        <label htmlFor="busca-no-glossario" className="apenas-leitor">
          Buscar termo
        </label>
        <input
          id="busca-no-glossario"
          type="search"
          className={styles.busca}
          placeholder="Buscar termo, como safety car ou pole"
          maxLength={60}
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <div className={styles.categorias} role="group" aria-label="Categorias">
          {(Object.entries(CATEGORIAS) as [Categoria, string][]).map(([chave, nome]) => (
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
        {encontrados.length} {encontrados.length === 1 ? 'termo' : 'termos'}
      </p>

      <dl className={styles.termos}>
        {encontrados.map((item) => (
          <div key={item.id} id={item.id} tabIndex={-1} className={styles.termo}>
            <dt className={styles.nome}>
              {item.nome}
              {item.tambem && <span className={styles.tambem}>{item.tambem}</span>}
            </dt>
            <dd className={styles.corpo}>
              <span className={styles.selo}>{CATEGORIAS[item.categoria]}</span>
              <p className={styles.definicao}>{item.definicao}</p>
              {item.relacionados.length > 0 && (
                <p className={styles.relacionados}>
                  Veja também:{' '}
                  {item.relacionados.map((id, indice) => (
                    <span key={id}>
                      {indice > 0 && ', '}
                      <a href={`#${id}`}>{POR_ID.get(id)?.nome ?? id}</a>
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
