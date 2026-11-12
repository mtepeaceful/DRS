import type { HistoriaDosCampeoesDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { campeoesDaHistoria } from './api';
import styles from './HistoriaPage.module.css';
import { pontos } from './numeros';

type Temporada = HistoriaDosCampeoesDTO['temporadas'][number];
type Recordista = HistoriaDosCampeoesDTO['maioresPilotos'][number];

function decadaDe(ano: number) {
  return Math.floor(ano / 10) * 10;
}

function Ranking({ titulo, recordistas }: { titulo: string; recordistas: Recordista[] }) {
  return (
    <section className={styles.cartao} aria-labelledby={`ranking-${titulo}`}>
      <h3 id={`ranking-${titulo}`} className={styles.tituloDoCartao}>
        {titulo}
      </h3>
      <ol className={styles.ranking}>
        {recordistas.map((recordista, indice) => (
          <li key={recordista.nome} className={styles.recordista}>
            <span className={styles.posicao}>{indice + 1}</span>
            <span className={styles.quem}>
              <span className={styles.nomeDoRecordista}>
                {recordista.pais && <Bandeira pais={recordista.pais} />}
                {nomeDaEquipe(recordista.nome)}
              </span>
              <span className={styles.anosDeTitulo}>{recordista.anos.join(' · ')}</span>
            </span>
            <span className={styles.titulos}>
              {recordista.titulos}
              <span className="apenas-leitor"> títulos</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Ano({ temporada }: { temporada: Temporada }) {
  return (
    <li>
      <Link to={`/historia/${temporada.ano}`} className={styles.ano}>
        <span className={styles.numeroDoAno}>{temporada.ano}</span>
        <span className={styles.campeao}>
          <span className={styles.nomeDoCampeao}>
            {temporada.pais && <Bandeira pais={temporada.pais} />}
            {temporada.piloto}
          </span>
          <span className={styles.equipe}>
            {nomeDaEquipe(temporada.equipe)} · {pontos(temporada.pontos)} pts · {temporada.vitorias}{' '}
            {temporada.vitorias === 1 ? 'vitória' : 'vitórias'}
          </span>
        </span>
        <span className={styles.construtor}>
          <span className={styles.rotuloDoConstrutor}>Construtores</span>
          {temporada.construtor ? nomeDaEquipe(temporada.construtor.nome) : 'Ainda não havia'}
        </span>
        <span className={styles.seta} aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}

export function HistoriaPage() {
  const historia = useQuery(campeoesDaHistoria);

  if (historia.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando a história…</span>
      </div>
    );
  }

  if (historia.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar a história"
        acao={
          <button type="button" className={botao.secundario} onClick={() => historia.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(historia.error)}
      </Aviso>
    );
  }

  const { temporadas, faltando, maioresPilotos, maioresConstrutores } = historia.data;
  const decadas = Map.groupBy(temporadas, (temporada) => decadaDe(temporada.ano));

  return (
    <>
      <title>História da F1 · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>História da F1</h1>
        <p className={styles.resumo}>
          Todos os campeões desde 1950. Abra um ano para ver a classificação, as equipes e cada
          corrida daquela temporada.
        </p>
        {faltando > 0 && (
          <p className={styles.carregando} role="status">
            Buscando o restante das temporadas: faltam {faltando}.
          </p>
        )}
      </header>

      {temporadas.length > 0 && (
        <section aria-labelledby="maiores-campeoes" className={styles.secao}>
          <h2 id="maiores-campeoes" className={styles.tituloDaSecao}>
            Maiores campeões
          </h2>
          <div className={styles.rankings}>
            <Ranking titulo="Pilotos" recordistas={maioresPilotos} />
            <Ranking titulo="Construtores" recordistas={maioresConstrutores} />
          </div>
        </section>
      )}

      <section aria-labelledby="ano-a-ano" className={styles.secao}>
        <h2 id="ano-a-ano" className={styles.tituloDaSecao}>
          Campeões ano a ano
        </h2>
        <nav aria-label="Décadas" className={styles.decadas}>
          {[...decadas.keys()].map((decada) => (
            <a key={decada} href={`#decada-${decada}`} className={styles.decada}>
              {decada}
            </a>
          ))}
        </nav>
        {[...decadas].map(([decada, anos]) => (
          <section key={decada} id={`decada-${decada}`} className={styles.grupo}>
            <h3 className={styles.tituloDaDecada}>Anos {String(decada).slice(2)}</h3>
            <ol className={styles.listaDeAnos}>
              {anos.map((temporada) => (
                <Ano key={temporada.ano} temporada={temporada} />
              ))}
            </ol>
          </section>
        ))}
      </section>
    </>
  );
}
