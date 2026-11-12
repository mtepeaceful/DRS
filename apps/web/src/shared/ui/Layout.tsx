import { useIsFetching } from '@tanstack/react-query';
import { Link, NavLink, Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { encerrarSessao, useSessaoAtiva } from '../api/sessao';
import { AsaTraseira } from './AsaTraseira';
import { AvisoDeEspera } from './AvisoDeEspera';
import botao from './botao.module.css';
import styles from './Layout.module.css';

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

  return (
    <>
      <a href="#conteudo" className={styles.pular}>
        Pular para o conteúdo
      </a>

      <header className={styles.cabecalho}>
        <div className={styles.barra}>
          <Link to="/" className={styles.marca} aria-label="DRS, página inicial">
            <AsaTraseira aberta={buscando} />
            DRS
          </Link>

          <nav aria-label="Principal" className={styles.nav}>
            <NavLink to="/" end className={classeDoInicio}>
              Início
            </NavLink>
            <NavLink to="/calendario" className={classeDoLink}>
              Calendário
            </NavLink>
            <NavLink to="/pilotos" className={classeDoLink}>
              Pilotos
            </NavLink>
            <NavLink to="/equipes" className={classeDoLink}>
              Equipes
            </NavLink>
            <NavLink to="/historia" className={classeDoLink}>
              História
            </NavLink>
          </nav>

          {logado ? (
            <div className={styles.sessao}>
              <Link to="/pilotos/novo" className={`${botao.primario} ${styles.acao}`}>
                <span aria-hidden="true">+</span> Novo piloto
              </Link>
              <button type="button" className={styles.link} onClick={encerrarSessao}>
                Sair
              </button>
            </div>
          ) : (
            <Link to="/entrar" className={`${botao.secundario} ${styles.acao}`}>
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main id="conteudo" className={styles.conteudo}>
        <Outlet />
      </main>

      <footer className={styles.rodape}>
        <p>DRS · Data Retrieval System da Fórmula 1</p>
        <nav aria-label="Dicionário da F1" className={styles.dicionario}>
          <Link to="/glossario">Glossário</Link>
          <Link to="/circuitos">Circuitos</Link>
          <Link to="/historia/pilotos">Pilotos da história</Link>
          <Link to="/classificacao">Campeonato</Link>
          <Link to="/comparar">Comparar pilotos</Link>
        </nav>
        <p className={styles.aviso}>
          Projeto pessoal, sem fins lucrativos e sem afiliação com a Fórmula 1, a FIA ou as equipes.
          Nomes, marcas e logos pertencem aos seus donos. Dados da OpenF1 e da Jolpica.
        </p>
      </footer>
      <AvisoDeEspera ativo={buscando} />
      <ScrollRestoration />
    </>
  );
}
