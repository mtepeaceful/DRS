import { useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useTextos } from '../i18n/idioma';
import styles from './MenuDoDicionario.module.css';

const TEXTOS = {
  pt: {
    titulo: 'Dicionário da F1',
    botao: 'Dicionário',
    paginas: [
      { para: '/glossario', nome: 'Glossário' },
      { para: '/circuitos', nome: 'Circuitos' },
      { para: '/historia/pilotos', nome: 'Pilotos da história' },
      { para: '/historia/carros', nome: 'Evolução dos carros' },
      { para: '/carro', nome: 'O carro por dentro' },
      { para: '/historia/drs', nome: 'A história do DRS' },
      { para: '/garagem', nome: 'Garagem com peças' },
      { para: '/classificacao', nome: 'Campeonato' },
      { para: '/comparar', nome: 'Comparar pilotos' },
    ],
  },
  en: {
    titulo: 'F1 dictionary',
    botao: 'Dictionary',
    paginas: [
      { para: '/glossario', nome: 'Glossary' },
      { para: '/circuitos', nome: 'Circuits' },
      { para: '/historia/pilotos', nome: 'Drivers in history' },
      { para: '/historia/carros', nome: 'How the cars evolved' },
      { para: '/carro', nome: 'Inside the car' },
      { para: '/historia/drs', nome: 'The story of DRS' },
      { para: '/garagem', nome: 'Garage with parts' },
      { para: '/classificacao', nome: 'Championship' },
      { para: '/comparar', nome: 'Compare drivers' },
    ],
  },
};

function classeDoLink({ isActive }: { isActive: boolean }) {
  return isActive ? styles.linkAtivo : styles.link;
}

function Links() {
  const t = useTextos(TEXTOS);

  return (
    <ul className={styles.lista}>
      {t.paginas.map((pagina) => (
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
  const t = useTextos(TEXTOS);

  return (
    <nav aria-label={t.titulo} className={styles.barra}>
      <p className={styles.titulo}>{t.titulo}</p>
      <Links />
    </nav>
  );
}

export function BotaoDoDicionario() {
  const { pathname } = useLocation();
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const aberto = abertoEm === pathname;
  const painel = useId();
  const t = useTextos(TEXTOS);

  return (
    <div className={styles.recolhido}>
      <button
        type="button"
        className={styles.botao}
        aria-expanded={aberto}
        aria-controls={painel}
        onClick={() => setAbertoEm(aberto ? null : pathname)}
      >
        {t.botao}
        <span aria-hidden="true" className={styles.seta}>
          ▾
        </span>
      </button>
      <nav id={painel} aria-label={t.titulo} className={styles.painel} hidden={!aberto}>
        <Links />
      </nav>
    </div>
  );
}
