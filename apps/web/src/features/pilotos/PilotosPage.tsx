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
import { COMUNS } from '../../shared/i18n/comuns';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './PilotosPage.module.css';

const TEXTOS = {
  pt: {
    titulo: 'Grid de pilotos',
    resultados: (total: number, busca: string) =>
      `${total} ${total === 1 ? 'resultado' : 'resultados'} para “${busca}”`,
    noGrid: (total: number) => `${total} ${total === 1 ? 'piloto' : 'pilotos'} no grid`,
    comparar: 'Comparar dois pilotos da temporada →',
    buscar: 'Buscar por piloto ou equipe',
    filtrar: 'Filtrar por equipe',
    todos: 'Todos',
    carregando: 'Carregando pilotos…',
    erro: 'Não foi possível carregar o grid',
    nenhum: 'Nenhum piloto encontrado',
    vazio: 'O grid está vazio',
    limpar: 'Limpar busca',
    cadastrar: 'Cadastrar o primeiro piloto',
    nada: (busca: string) =>
      `Nada corresponde a “${busca}”. Confira a grafia ou busque pelo nome da equipe.`,
    cadastre: 'Cadastre um piloto para ele aparecer aqui.',
    pilotos: 'Pilotos',
    creditos: 'Fotos do Wikimedia Commons, com autor e licença na página de cada piloto.',
    paginacao: 'Paginação',
    anterior: '← Anterior',
    pagina: (pagina: number, total: number) => `Página ${pagina} de ${total}`,
    proxima: 'Próxima →',
  },
  en: {
    titulo: 'Driver grid',
    resultados: (total: number, busca: string) =>
      `${total} ${total === 1 ? 'result' : 'results'} for “${busca}”`,
    noGrid: (total: number) => `${total} ${total === 1 ? 'driver' : 'drivers'} on the grid`,
    comparar: 'Compare two drivers this season →',
    buscar: 'Search by driver or team',
    filtrar: 'Filter by team',
    todos: 'All',
    carregando: 'Loading drivers…',
    erro: 'Could not load the grid',
    nenhum: 'No drivers found',
    vazio: 'The grid is empty',
    limpar: 'Clear search',
    cadastrar: 'Add the first driver',
    nada: (busca: string) =>
      `Nothing matches “${busca}”. Check the spelling or search by team name.`,
    cadastre: 'Add a driver for them to show up here.',
    pilotos: 'Drivers',
    creditos: 'Photos from Wikimedia Commons, with author and license on each driver’s page.',
    paginacao: 'Pagination',
    anterior: '← Previous',
    pagina: (pagina: number, total: number) => `Page ${pagina} of ${total}`,
    proxima: 'Next →',
  },
};

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
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);
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
      <title>{`${t.titulo} · DRS`}</title>

      <section className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo} aria-live="polite">
          {pilotos.data && (busca ? t.resultados(total, busca) : t.noGrid(total))}
        </p>

        <Link to="/comparar" className={styles.comparar}>
          {t.comparar}
        </Link>

        {logado && <ImportarTemporada />}

        <form role="search" className={styles.busca} onSubmit={aplicarBusca}>
          <label htmlFor="busca" className="apenas-leitor">
            {t.buscar}
          </label>
          <input
            ref={campoDeBusca}
            id="busca"
            type="search"
            className={styles.campoDeBusca}
            placeholder={t.buscar}
            maxLength={100}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <kbd className={styles.atalho} aria-hidden="true">
            /
          </kbd>
        </form>

        {equipes.data && equipes.data.length > 0 && (
          <nav aria-label={t.filtrar} className={styles.filtros}>
            <Link
              to="/pilotos"
              className={busca ? styles.filtro : styles.filtroAtivo}
              aria-current={busca ? undefined : 'page'}
            >
              {t.todos}
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
          <span className="apenas-leitor">{t.carregando}</span>
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
          titulo={t.erro}
          acao={
            <button type="button" className={botao.secundario} onClick={() => pilotos.refetch()}>
              {comuns.tentarDeNovo}
            </button>
          }
        >
          {mensagemDoErro(pilotos.error)}
        </Aviso>
      )}

      {pilotos.data && total === 0 && (
        <Aviso
          titulo={busca ? t.nenhum : t.vazio}
          acao={
            busca ? (
              <Link to="/pilotos" className={botao.secundario}>
                {t.limpar}
              </Link>
            ) : (
              <Link to="/pilotos/novo" className={botao.primario}>
                {t.cadastrar}
              </Link>
            )
          }
        >
          {busca ? t.nada(busca) : t.cadastre}
        </Aviso>
      )}

      {pilotos.data && total > 0 && (
        <>
          <ul
            className={styles.grade}
            data-atualizando={pilotos.isPlaceholderData || undefined}
            aria-label={t.pilotos}
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
                  foto={piloto.foto ?? undefined}
                />
              </li>
            ))}
          </ul>

          {pilotos.data.itens.some((piloto) => piloto.foto) && (
            <p className={styles.creditoDasFotos}>{t.creditos}</p>
          )}

          {paginas > 1 && (
            <nav aria-label={t.paginacao} className={styles.paginacao}>
              {pagina > 1 ? (
                <Link
                  to={`/pilotos?${parametrosDe(busca, pagina - 1)}`}
                  className={botao.secundario}
                >
                  {t.anterior}
                </Link>
              ) : (
                <span />
              )}
              <span className={styles.paginaAtual}>{t.pagina(pagina, paginas)}</span>
              {pagina < paginas ? (
                <Link
                  to={`/pilotos?${parametrosDe(busca, pagina + 1)}`}
                  className={botao.secundario}
                >
                  {t.proxima}
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
