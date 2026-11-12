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
import { equipesDaHistoria } from './api';
import styles from './EquipesPage.module.css';

function Titulos({ equipe }: { equipe: ResumoDaEquipeDTO }) {
  if (equipe.titulosDeConstrutores === 0 && equipe.titulosDePilotos === 0) {
    return null;
  }

  return (
    <span className={styles.titulos}>
      {equipe.titulosDeConstrutores > 0 && (
        <span className={styles.selo}>
          {equipe.titulosDeConstrutores} {equipe.titulosDeConstrutores === 1 ? 'título' : 'títulos'}{' '}
          de construtores
        </span>
      )}
      {equipe.titulosDePilotos > 0 && (
        <span className={styles.seloSuave}>{equipe.titulosDePilotos} de pilotos</span>
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

  if (equipes.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando as equipes…</span>
      </div>
    );
  }

  if (equipes.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar as equipes"
        acao={
          <button type="button" className={botao.secundario} onClick={() => equipes.refetch()}>
            Tentar de novo
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
      <title>Equipes · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Equipes</h1>
        <p className={styles.resumo}>
          As {equipes.data.length} equipes que já correram na Fórmula 1 desde 1950, das que estão no
          grid às que viraram história.
        </p>
        {logado && (
          <Link to="/equipes/gerenciar" className={styles.gerenciar}>
            Gerenciar as cores das equipes do grid →
          </Link>
        )}
      </header>

      {gridAtual.length > 0 && (
        <section aria-labelledby="grid-atual" className={styles.secao}>
          <h2 id="grid-atual" className={styles.tituloDaSecao}>
            No grid em {new Date().getFullYear()}
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
          Todas as equipes
        </h2>
        <div className={styles.filtros}>
          <label htmlFor="busca-de-equipe" className="apenas-leitor">
            Buscar equipe
          </label>
          <input
            id="busca-de-equipe"
            type="search"
            className={styles.busca}
            placeholder="Buscar equipe, como Lotus ou Brabham"
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
            Só as campeãs
          </label>
        </div>
        <p className={styles.contagem} aria-live="polite">
          {encontradas.length} {encontradas.length === 1 ? 'equipe' : 'equipes'}
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
