import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import botao from './botao.module.css';
import styles from './Layout.module.css';

function classeDoLink({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.linkAtivo}` : styles.link;
}

export function Layout() {
  return (
    <>
      <a href="#conteudo" className={styles.pular}>
        Pular para o conteúdo
      </a>

      <header className={styles.cabecalho}>
        <div className={styles.barra}>
          <Link to="/" className={styles.marca} aria-label="DRS, página inicial">
            <span className={styles.asa} aria-hidden="true">
              <span className={styles.flap} />
              <span className={styles.plano} />
            </span>
            DRS
          </Link>

          <nav aria-label="Principal" className={styles.nav}>
            <NavLink to="/" end className={classeDoLink}>
              Grid
            </NavLink>
            <NavLink to="/equipes" className={classeDoLink}>
              Equipes
            </NavLink>
          </nav>

          <Link to="/pilotos/novo" className={`${botao.primario} ${styles.acao}`}>
            <span aria-hidden="true">+</span> Novo piloto
          </Link>
        </div>
      </header>

      <main id="conteudo" className={styles.conteudo}>
        <Outlet />
      </main>

      <footer className={styles.rodape}>DRS · gerenciamento de pilotos de Fórmula 1</footer>
      <ScrollRestoration />
    </>
  );
}
