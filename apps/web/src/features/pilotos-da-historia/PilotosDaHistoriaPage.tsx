import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import chip from '../../shared/ui/chip.module.css';
import botao from '../../shared/ui/botao.module.css';
import { pilotosDaHistoria } from './api';
import styles from './PilotosDaHistoriaPage.module.css';

const POR_PAGINA = 60;

type Filtro = 'todos' | 'campeoes';

const FILTROS: Record<Filtro, string> = { todos: 'Todos', campeoes: 'Campeões' };

function titulo(filtro: Filtro, termo: string, total: number) {
  if (termo) return `${total} ${total === 1 ? 'piloto encontrado' : 'pilotos encontrados'}`;

  return filtro === 'campeoes' ? 'Campeões mundiais' : 'Todos os pilotos';
}

export function PilotosDaHistoriaPage() {
  const pilotos = useQuery(pilotosDaHistoria);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [quantidade, setQuantidade] = useState(POR_PAGINA);
  const termo = semAcento(useDeferredValue(busca).trim());

  if (pilotos.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando os pilotos…</span>
      </div>
    );
  }

  if (pilotos.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar os pilotos"
        acao={
          <button type="button" className={botao.secundario} onClick={() => pilotos.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(pilotos.error)}
      </Aviso>
    );
  }

  const doFiltro =
    filtro === 'campeoes'
      ? pilotos.data
          .filter((piloto) => piloto.titulos > 0)
          .toSorted((a, b) => b.titulos - a.titulos || a.nome.localeCompare(b.nome, 'pt-BR'))
      : pilotos.data.toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const encontrados = termo
    ? doFiltro.filter((piloto) => semAcento(piloto.nome).includes(termo))
    : doFiltro;
  const visiveis = encontrados.slice(0, quantidade);

  return (
    <>
      <title>Pilotos da história · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Pilotos da história</h1>
        <p className={styles.resumo}>
          Os {pilotos.data.length} pilotos que já correram na Fórmula 1 desde 1950. Busque qualquer
          um pelo nome, de Fangio a Bortoleto.
        </p>
      </header>

      <label htmlFor="busca-de-piloto" className="apenas-leitor">
        Buscar piloto
      </label>
      <input
        id="busca-de-piloto"
        type="search"
        className={styles.busca}
        placeholder="Buscar piloto pelo nome"
        maxLength={60}
        value={busca}
        onChange={(evento) => {
          setBusca(evento.target.value);
          setQuantidade(POR_PAGINA);
        }}
      />

      <div className={styles.filtros} role="group" aria-label="Mostrar">
        {(Object.entries(FILTROS) as [Filtro, string][]).map(([chave, nome]) => (
          <button
            key={chave}
            type="button"
            className={filtro === chave ? chip.chipAtivo : chip.chip}
            aria-pressed={filtro === chave}
            onClick={() => {
              setFiltro(chave);
              setQuantidade(POR_PAGINA);
            }}
          >
            {nome}
          </button>
        ))}
      </div>

      <h2 className={styles.tituloDaLista} aria-live="polite">
        {titulo(filtro, termo, encontrados.length)}
      </h2>

      <ul className={styles.lista}>
        {visiveis.map((piloto) => (
          <li key={piloto.id}>
            <Link to={`/historia/pilotos/${piloto.id}`} className={styles.linha}>
              <span className={styles.nome}>
                {piloto.pais ? (
                  <Bandeira pais={piloto.pais} />
                ) : (
                  <span className={styles.semBandeira} />
                )}
                {piloto.nome}
              </span>
              {piloto.nascimento && (
                <span className={styles.nascimento}>Nasceu em {piloto.nascimento.slice(0, 4)}</span>
              )}
              {piloto.titulos > 0 && (
                <span className={styles.selo}>
                  {piloto.titulos} {piloto.titulos === 1 ? 'título' : 'títulos'}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {encontrados.length > 0 && (
        <div className={styles.rodapeDaLista}>
          <p className={styles.aviso}>
            Mostrando {visiveis.length} de {encontrados.length}
          </p>
          {visiveis.length < encontrados.length && (
            <button
              type="button"
              className={botao.secundario}
              onClick={() => setQuantidade((atual) => atual + POR_PAGINA)}
            >
              Mostrar mais pilotos
            </button>
          )}
        </div>
      )}
    </>
  );
}
