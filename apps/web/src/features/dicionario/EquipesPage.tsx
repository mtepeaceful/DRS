import type { ResumoDaEquipeDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { useSessaoAtiva } from '../../shared/api/sessao';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { CORES_NEUTRAS } from '../calendario/cores';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { COMUNS } from '../../shared/i18n/comuns';
import { useTextos } from '../../shared/i18n/idioma';
import { equipesDaHistoria } from './api';
import styles from './EquipesPage.module.css';

const TEXTOS = {
  pt: {
    construtores: (n: number) => `${n} ${n === 1 ? 'título' : 'títulos'} de construtores`,
    pilotos: (n: number) => `${n} ${n === 1 ? 'título' : 'títulos'} de pilotos`,
    carregando: '{t.carregando}',
    erro: 'Não foi possível carregar as equipes',
    titulo: 'Equipes',
    resumo: (n: number) =>
      `As ${n} equipes que já correram na Fórmula 1 desde 1950, das que estão no grid às que viraram história.`,
    gerenciar: 'Gerenciar as cores das equipes do grid →',
    noGrid: (ano: number) => `No grid em ${ano}`,
    todas: 'Todas as equipes',
    buscar: 'Buscar equipe',
    exemplo: 'Buscar equipe, como Lotus ou Brabham',
    campeas: 'Só as campeãs',
    contagem: (n: number) => `${n} ${n === 1 ? 'equipe' : 'equipes'}`,
  },
  en: {
    construtores: (n: number) => `${n} constructors’ ${n === 1 ? 'title' : 'titles'}`,
    pilotos: (n: number) => `${n} drivers’ ${n === 1 ? 'title' : 'titles'}`,
    carregando: 'Loading the teams…',
    erro: 'Could not load the teams',
    titulo: 'Teams',
    resumo: (n: number) =>
      `The ${n} teams that have raced in Formula 1 since 1950, from those on the grid to those now in the history books.`,
    gerenciar: 'Manage the colours of the teams on the grid →',
    noGrid: (ano: number) => `On the ${ano} grid`,
    todas: 'All teams',
    buscar: 'Search for a team',
    exemplo: 'Search for a team, like Lotus or Brabham',
    campeas: 'Champions only',
    contagem: (n: number) => `${n} ${n === 1 ? 'team' : 'teams'}`,
  },
};

function Titulos({ equipe }: { equipe: ResumoDaEquipeDTO }) {
  const t = useTextos(TEXTOS);

  if (equipe.titulosDeConstrutores === 0 && equipe.titulosDePilotos === 0) {
    return null;
  }

  return (
    <span className={styles.titulos}>
      {equipe.titulosDeConstrutores > 0 && (
        <span className={styles.selo}>{t.construtores(equipe.titulosDeConstrutores)}</span>
      )}
      {equipe.titulosDePilotos > 0 && (
        <span className={styles.selo}>{t.pilotos(equipe.titulosDePilotos)}</span>
      )}
    </span>
  );
}

export function EquipesPage() {
  const equipes = useQuery(equipesDaHistoria);
  const logado = useSessaoAtiva();
  const [busca, setBusca] = useState('');
  const [soCampeas, setSoCampeas] = useState(false);
  const termo = semAcento(useDeferredValue(busca).trim());
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  if (equipes.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (equipes.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => equipes.refetch()}>
            {comuns.tentarDeNovo}
          </button>
        }
      >
        {mensagemDoErro(equipes.error)}
      </Aviso>
    );
  }

  const gridAtual = equipes.data.filter((equipe) => equipe.noGridAtual);
  const encontradas = equipes.data.filter(
    (equipe) =>
      (!soCampeas || equipe.titulosDeConstrutores + equipe.titulosDePilotos > 0) &&
      semAcento(`${equipe.nome} ${nomeDaEquipe(equipe.nome)}`).includes(termo),
  );

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo(equipes.data.length)}</p>
        {logado && (
          <Link to="/equipes/gerenciar" className={styles.gerenciar}>
            {t.gerenciar}
          </Link>
        )}
      </header>

      {gridAtual.length > 0 && (
        <section aria-labelledby="grid-atual" className={styles.secao}>
          <h2 id="grid-atual" className={styles.tituloDaSecao}>
            {t.noGrid(new Date().getFullYear())}
          </h2>
          <ul className={styles.grid}>
            {gridAtual.map((equipe) => (
              <li key={equipe.id}>
                <Link to={`/equipes/${equipe.id}`} className={styles.cartao}>
                  <span className={styles.logo}>
                    <SimboloDaEquipe nome={equipe.nome} {...CORES_NEUTRAS} tamanho="grande" />
                  </span>
                  <span className={styles.nomeDoCartao}>{nomeDaEquipe(equipe.nome)}</span>
                  <Titulos equipe={equipe} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="todas" className={styles.secao}>
        <h2 id="todas" className={styles.tituloDaSecao}>
          {t.todas}
        </h2>
        <div className={styles.filtros}>
          <label htmlFor="busca-de-equipe" className="apenas-leitor">
            {t.buscar}
          </label>
          <input
            id="busca-de-equipe"
            type="search"
            className={styles.busca}
            placeholder={t.exemplo}
            maxLength={60}
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
          <label className={styles.opcao}>
            <input
              type="checkbox"
              checked={soCampeas}
              onChange={(evento) => setSoCampeas(evento.target.checked)}
            />
            {t.campeas}
          </label>
        </div>
        <p className={styles.contagem} aria-live="polite">
          {t.contagem(encontradas.length)}
        </p>
        <ul className={styles.lista}>
          {encontradas.map((equipe) => (
            <li key={equipe.id}>
              <Link to={`/equipes/${equipe.id}`} className={styles.linha}>
                <span className={styles.nome}>
                  {equipe.pais ? (
                    <Bandeira pais={equipe.pais} />
                  ) : (
                    <span className={styles.semBandeira} />
                  )}
                  {nomeDaEquipe(equipe.nome)}
                </span>
                <Titulos equipe={equipe} />
                <span className={styles.seta} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
