import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import chip from '../../shared/ui/chip.module.css';
import botao from '../../shared/ui/botao.module.css';
import { COMUNS } from '../../shared/i18n/comuns';
import { localeDo, useIdioma, useTextos } from '../../shared/i18n/idioma';
import { pilotosDaHistoria } from './api';
import styles from './PilotosDaHistoriaPage.module.css';

const POR_PAGINA = 60;

type Filtro = 'todos' | 'campeoes';

const TEXTOS = {
  pt: {
    filtros: { todos: 'Todos', campeoes: 'Campeões' } as Record<Filtro, string>,
    encontrados: (n: number) => `${n} ${n === 1 ? 'piloto encontrado' : 'pilotos encontrados'}`,
    campeoes: 'Campeões mundiais',
    todos: 'Todos os pilotos',
    carregando: '{t.carregando}',
    erro: 'Não foi possível carregar os pilotos',
    titulo: 'Pilotos da história',
    resumo: (n: number) =>
      `Os ${n} pilotos que já correram na Fórmula 1 desde 1950. Busque qualquer um pelo nome, de Fangio a Bortoleto.`,
    buscar: 'Buscar piloto',
    exemplo: 'Buscar piloto pelo nome',
    mostrar: 'Mostrar',
    nasceu: (ano: string) => `Nasceu em ${ano}`,
    titulos: (n: number) => `${n} ${n === 1 ? 'título' : 'títulos'}`,
    mostrando: (de: number, total: number) => `Mostrando ${de} de ${total}`,
    mais: 'Mostrar mais pilotos',
  },
  en: {
    filtros: { todos: 'All', campeoes: 'Champions' } as Record<Filtro, string>,
    encontrados: (n: number) => `${n} ${n === 1 ? 'driver found' : 'drivers found'}`,
    campeoes: 'World champions',
    todos: 'All drivers',
    carregando: 'Loading the drivers…',
    erro: 'Could not load the drivers',
    titulo: 'Drivers in history',
    resumo: (n: number) =>
      `The ${n} drivers who have raced in Formula 1 since 1950. Search for anyone by name, from Fangio to Bortoleto.`,
    buscar: 'Search for a driver',
    exemplo: 'Search for a driver by name',
    mostrar: 'Show',
    nasceu: (ano: string) => `Born in ${ano}`,
    titulos: (n: number) => `${n} ${n === 1 ? 'title' : 'titles'}`,
    mostrando: (de: number, total: number) => `Showing ${de} of ${total}`,
    mais: 'Show more drivers',
  },
};

export function PilotosDaHistoriaPage() {
  const pilotos = useQuery(pilotosDaHistoria);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [quantidade, setQuantidade] = useState(POR_PAGINA);
  const termo = semAcento(useDeferredValue(busca).trim());
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);
  const locale = localeDo(useIdioma());

  if (pilotos.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (pilotos.isError) {
    return (
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
    );
  }

  const doFiltro =
    filtro === 'campeoes'
      ? pilotos.data
          .filter((piloto) => piloto.titulos > 0)
          .toSorted((a, b) => b.titulos - a.titulos || a.nome.localeCompare(b.nome, locale))
      : pilotos.data.toSorted((a, b) => a.nome.localeCompare(b.nome, locale));
  const encontrados = termo
    ? doFiltro.filter((piloto) => semAcento(piloto.nome).includes(termo))
    : doFiltro;
  const visiveis = encontrados.slice(0, quantidade);

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo(pilotos.data.length)}</p>
      </header>

      <label htmlFor="busca-de-piloto" className="apenas-leitor">
        {t.buscar}
      </label>
      <input
        id="busca-de-piloto"
        type="search"
        className={styles.busca}
        placeholder={t.exemplo}
        maxLength={60}
        value={busca}
        onChange={(evento) => {
          setBusca(evento.target.value);
          setQuantidade(POR_PAGINA);
        }}
      />

      <div className={styles.filtros} role="group" aria-label={t.mostrar}>
        {(Object.entries(t.filtros) as [Filtro, string][]).map(([chave, nome]) => (
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
        {termo ? t.encontrados(encontrados.length) : filtro === 'campeoes' ? t.campeoes : t.todos}
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
                <span className={styles.nascimento}>{t.nasceu(piloto.nascimento.slice(0, 4))}</span>
              )}
              {piloto.titulos > 0 && (
                <span className={styles.selo}>{t.titulos(piloto.titulos)}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {encontrados.length > 0 && (
        <div className={styles.rodapeDaLista}>
          <p className={styles.aviso}>{t.mostrando(visiveis.length, encontrados.length)}</p>
          {visiveis.length < encontrados.length && (
            <button
              type="button"
              className={botao.secundario}
              onClick={() => setQuantidade((atual) => atual + POR_PAGINA)}
            >
              {t.mais}
            </button>
          )}
        </div>
      )}
    </>
  );
}
