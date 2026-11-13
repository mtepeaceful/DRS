import { useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import styles from './MenuDoDicionario.module.css';

const PAGINAS = [
  { para: '/glossario', nome: 'Glossário' },
  { para: '/circuitos', nome: 'Circuitos' },
  { para: '/historia/pilotos', nome: 'Pilotos da história' },
  { para: '/historia/carros', nome: 'Evolução dos carros' },
  { para: '/carro', nome: 'O carro por dentro' },
  { para: '/classificacao', nome: 'Campeonato' },
  { para: '/comparar', nome: 'Comparar pilotos' },
];

function classeDoLink({ isActive }: { isActive: boolean }) {
  return isActive ? styles.linkAtivo : styles.link;
}

function Links() {
  return (
    <ul className={styles.lista}>
      {PAGINAS.map((pagina) => (
        <li key={pagina.para}>
          <NavLink to={pagina.para} end className={classeDoLink}>
            {pagina.nome}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function BarraDoDicionario() {
  return (
    <nav aria-label="Dicionário da F1" className={styles.barra}>
      <p className={styles.titulo}>Dicionário da F1</p>
      <Links />
    </nav>
  );
}

export function BotaoDoDicionario() {
  const { pathname } = useLocation();
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const aberto = abertoEm === pathname;
  const painel = useId();

  return (
    <div className={styles.recolhido}>
      <button
        type="button"
        className={styles.botao}
        aria-expanded={aberto}
        aria-controls={painel}
        onClick={() => setAbertoEm(aberto ? null : pathname)}
      >
        Dicionário
        <span aria-hidden="true" className={styles.seta}>
          ▾
        </span>
      </button>
      <nav id={painel} aria-label="Dicionário da F1" className={styles.painel} hidden={!aberto}>
        <Links />
      </nav>
    </div>
  );
}
