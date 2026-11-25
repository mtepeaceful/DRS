import { useIsFetching } from '@tanstack/react-query';
import { Link, NavLink, Outlet, ScrollRestoration, useMatch, useNavigation } from 'react-router';
import { encerrarSessao, useSessaoAtiva } from '../api/sessao';
import { useIdioma, useTextos } from '../i18n/idioma';
import { AsaTraseira } from './AsaTraseira';
import { AvisoDeEspera } from './AvisoDeEspera';
import { BarraDoDicionario, BotaoDoDicionario } from './MenuDoDicionario';
import { SeletorDeIdioma } from './SeletorDeIdioma';
import botao from './botao.module.css';
import styles from './Layout.module.css';

const TEXTOS = {
  pt: {
    pular: 'Pular para o conteúdo',
    inicioDoSite: 'DRS, página inicial',
    principal: 'Principal',
    inicio: 'Início',
    calendario: 'Calendário',
    pilotos: 'Pilotos',
    equipes: 'Equipes',
    historia: 'História',
    novoPiloto: 'Novo piloto',
    sair: 'Sair',
    entrar: 'Entrar',
    nome: 'DRS · Data Retrieval System, um projeto de fã sobre a Fórmula 1',
    aviso:
      'Projeto pessoal, sem fins lucrativos e sem afiliação com a Fórmula 1, a FIA ou as equipes. Nomes, marcas e logos pertencem aos seus donos. Dados da OpenF1 e da Jolpica.',
  },
  en: {
    pular: 'Skip to content',
    inicioDoSite: 'DRS, home page',
    principal: 'Main',
    inicio: 'Home',
    calendario: 'Calendar',
    pilotos: 'Drivers',
    equipes: 'Teams',
    historia: 'History',
    novoPiloto: 'New driver',
    sair: 'Sign out',
    entrar: 'Sign in',
    nome: 'DRS · Data Retrieval System, a fan project about Formula 1',
    aviso:
      'Personal, non-profit project with no affiliation to Formula 1, the FIA or the teams. Names, trademarks and logos belong to their owners. Data from OpenF1 and Jolpica.',
  },
};

function classeDoLink({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.linkAtivo}` : styles.link;
}

function classeDoInicio(estado: { isActive: boolean }) {
  return `${classeDoLink(estado)} ${styles.inicio}`;
}

export function Layout() {
  const buscandoDados = useIsFetching() > 0;
  const trocandoDePagina = useNavigation().state !== 'idle';
  const buscando = buscandoDados || trocandoDePagina;
  const logado = useSessaoAtiva();
  const naEntrada = useMatch('/entrar') !== null;
  const t = useTextos(TEXTOS);
  const idioma = useIdioma();

  return (
    <>
      <a href="#conteudo" className={styles.pular}>
        {t.pular}
      </a>

      <header className={styles.cabecalho}>
        <span className={styles.zonaDrs} data-aberta={buscando || undefined} aria-hidden="true" />
        <div className={styles.barra}>
          <Link to="/" className={styles.marca} aria-label={t.inicioDoSite}>
            <AsaTraseira aberta={buscando} />
            DRS
          </Link>

          <nav aria-label={t.principal} className={styles.nav}>
            <NavLink to="/" end className={classeDoInicio}>
              {t.inicio}
            </NavLink>
            <NavLink to="/calendario" className={classeDoLink}>
              {t.calendario}
            </NavLink>
            <NavLink to="/pilotos" className={classeDoLink}>
              {t.pilotos}
            </NavLink>
            <NavLink to="/equipes" className={classeDoLink}>
              {t.equipes}
            </NavLink>
            <NavLink to="/historia" className={classeDoLink}>
              {t.historia}
            </NavLink>
          </nav>

          <div className={styles.atalhoDoDicionario}>
            <BotaoDoDicionario />
          </div>

          <SeletorDeIdioma />

          {logado ? (
            <div className={styles.sessao}>
              <Link to="/pilotos/novo" className={`${botao.primario} ${styles.acao}`}>
                <span aria-hidden="true">+</span> {t.novoPiloto}
              </Link>
              <button type="button" className={styles.link} onClick={encerrarSessao}>
                {t.sair}
              </button>
            </div>
          ) : (
            <Link to="/entrar" className={`${botao.secundario} ${styles.acao}`}>
              {t.entrar}
            </Link>
          )}
        </div>
      </header>

      <div className={naEntrada ? styles.corpoSemLateral : styles.corpo}>
        {!naEntrada && (
          <aside className={styles.lateral}>
            <BarraDoDicionario />
          </aside>
        )}
        <main id="conteudo" className={styles.conteudo}>
          <Outlet key={idioma} />
        </main>
      </div>

      <footer className={styles.rodape}>
        <p>{t.nome}</p>
        <p className={styles.aviso}>{t.aviso}</p>
      </footer>
      <AvisoDeEspera ativo={buscando} />
      <ScrollRestoration />
    </>
  );
}
