import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { useSessaoAtiva } from '../../shared/api/sessao';
import { listaDeEquipes } from '../equipes/api';
import { ImportarTemporada } from '../importacao/ImportarTemporada';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { listaDePilotos, PILOTOS_POR_PAGINA } from './api';
import { CartaoDoPiloto } from './CartaoDoPiloto';
import styles from './PilotosPage.module.css';

const ATRASO_DA_BUSCA = 300;

function parametrosDe(busca: string, pagina = 1) {
  const parametros = new URLSearchParams();

  if (busca) {
    parametros.set('busca', busca);
  }

  if (pagina > 1) {
    parametros.set('pagina', String(pagina));
  }

  return parametros;
}

export function PilotosPage() {
  const [parametros, setParametros] = useSearchParams();
  const busca = parametros.get('busca') ?? '';
  const pagina = Math.max(1, Math.trunc(Number(parametros.get('pagina'))) || 1);

  const [texto, setTexto] = useState(busca);
  const [buscaAplicada, setBuscaAplicada] = useState(busca);
  const campoDeBusca = useRef<HTMLInputElement>(null);

  if (busca !== buscaAplicada) {
    setBuscaAplicada(busca);
    setTexto(busca);
  }

  useEffect(() => {
    if (texto === busca) {
      return;
    }

    const espera = setTimeout(
      () => setParametros(parametrosDe(texto), { replace: true }),
      ATRASO_DA_BUSCA,
    );

    return () => clearTimeout(espera);
  }, [texto, busca, setParametros]);

  useEffect(() => {
    function focarBusca(evento: KeyboardEvent) {
      const digitando =
        evento.target instanceof HTMLElement &&
        evento.target.closest('input, select, textarea, [contenteditable]');

      if (evento.key === '/' && !digitando) {
        evento.preventDefault();
        campoDeBusca.current?.focus();
      }
    }

    window.addEventListener('keydown', focarBusca);

    return () => window.removeEventListener('keydown', focarBusca);
  }, []);

  const logado = useSessaoAtiva();
  const pilotos = useQuery(listaDePilotos(busca, pagina));
  const equipes = useQuery(listaDeEquipes);

  const total = pilotos.data?.total ?? 0;
  const equipeAtiva = (nome: string) => busca.toLowerCase() === nome.toLowerCase();
  const paginas = Math.max(1, Math.ceil(total / PILOTOS_POR_PAGINA));

  function aplicarBusca(evento: FormEvent) {
    evento.preventDefault();
    setParametros(parametrosDe(texto));
  }

  return (
    <>
      <title>Grid de pilotos · DRS</title>

      <section className={styles.topo}>
        <h1 className={styles.titulo}>Grid de pilotos</h1>
        <p className={styles.resumo} aria-live="polite">
          {pilotos.data &&
            (busca
              ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para “${busca}”`
              : `${total} ${total === 1 ? 'piloto' : 'pilotos'} no grid`)}
        </p>

        <Link to="/comparar" className={styles.comparar}>
          Comparar dois pilotos da temporada →
        </Link>

        {logado && <ImportarTemporada />}

        <form role="search" className={styles.busca} onSubmit={aplicarBusca}>
          <label htmlFor="busca" className="apenas-leitor">
            Buscar por piloto ou equipe
          </label>
          <input
            ref={campoDeBusca}
            id="busca"
            type="search"
            className={styles.campoDeBusca}
            placeholder="Buscar por piloto ou equipe"
            maxLength={100}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <kbd className={styles.atalho} aria-hidden="true">
            /
          </kbd>
        </form>

        {equipes.data && equipes.data.length > 0 && (
          <nav aria-label="Filtrar por equipe" className={styles.filtros}>
            <Link
              to="/pilotos"
              className={busca ? styles.filtro : styles.filtroAtivo}
              aria-current={busca ? undefined : 'page'}
            >
              Todos
            </Link>
            {equipes.data.map((equipe) => (
              <Link
                key={equipe.id}
                to={`/pilotos?${parametrosDe(equipe.nome)}`}
                className={equipeAtiva(equipe.nome) ? styles.filtroAtivo : styles.filtro}
                aria-current={equipeAtiva(equipe.nome) ? 'page' : undefined}
              >
                <SimboloDaEquipe {...equipe} />
                {equipe.nome}
              </Link>
            ))}
          </nav>
        )}
      </section>

      {pilotos.isPending && (
        <div role="status">
          <span className="apenas-leitor">Carregando pilotos…</span>
          <ul className={styles.grade} aria-hidden="true">
            {Array.from({ length: 6 }, (_, indice) => (
              <li key={indice} className={styles.esqueleto} />
            ))}
          </ul>
        </div>
      )}

      {pilotos.isError && (
        <Aviso
          tipo="erro"
          titulo="Não foi possível carregar o grid"
          acao={
            <button type="button" className={botao.secundario} onClick={() => pilotos.refetch()}>
              Tentar de novo
            </button>
          }
        >
          {mensagemDoErro(pilotos.error)}
        </Aviso>
      )}

      {pilotos.data && total === 0 && (
        <Aviso
          titulo={busca ? 'Nenhum piloto encontrado' : 'O grid está vazio'}
          acao={
            busca ? (
              <Link to="/pilotos" className={botao.secundario}>
                Limpar busca
              </Link>
            ) : (
              <Link to="/pilotos/novo" className={botao.primario}>
                Cadastrar o primeiro piloto
              </Link>
            )
          }
        >
          {busca
            ? `Nada corresponde a “${busca}”. Confira a grafia ou busque pelo nome da equipe.`
            : 'Cadastre um piloto para ele aparecer aqui.'}
        </Aviso>
      )}

      {pilotos.data && total > 0 && (
        <>
          <ul
            className={styles.grade}
            data-atualizando={pilotos.isPlaceholderData || undefined}
            aria-label="Pilotos"
          >
            {pilotos.data.itens.map((piloto) => (
              <li key={piloto.id}>
                <CartaoDoPiloto
                  nome={piloto.nome}
                  numero={piloto.numero}
                  pais={piloto.pais}
                  titulos={piloto.titulos}
                  equipe={piloto.equipe}
                  para={`/pilotos/${piloto.id}`}
                />
              </li>
            ))}
          </ul>

          {paginas > 1 && (
            <nav aria-label="Paginação" className={styles.paginacao}>
              {pagina > 1 ? (
                <Link
                  to={`/pilotos?${parametrosDe(busca, pagina - 1)}`}
                  className={botao.secundario}
                >
                  ← Anterior
                </Link>
              ) : (
                <span />
              )}
              <span className={styles.paginaAtual}>
                Página {pagina} de {paginas}
              </span>
              {pagina < paginas ? (
                <Link
                  to={`/pilotos?${parametrosDe(busca, pagina + 1)}`}
                  className={botao.secundario}
                >
                  Próxima →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
