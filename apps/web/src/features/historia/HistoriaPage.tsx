import type { HistoriaDosCampeoesDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { campeoesDaHistoria } from './api';
import { LinhaDoTempo } from './LinhaDoTempo';
import { NomeDoPiloto } from '../pilotos-da-historia/NomeDoPiloto';
import { COMUNS } from '../../shared/i18n/comuns';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './HistoriaPage.module.css';

const TEXTOS = {
  pt: {
    titulos: ' títulos',
    construtores: 'Construtores',
    aindaNaoHavia: 'Ainda não havia',
    carregando: 'Carregando a história…',
    erro: 'Não foi possível carregar a história',
    titulo: 'História da F1',
    resumo:
      'Todos os campeões desde 1950. Abra um ano para ver a classificação, as equipes e cada corrida daquela temporada.',
    dicionario: 'Dicionário',
    todosOsPilotos: 'Todos os pilotos →',
    todasAsEquipes: 'Todas as equipes →',
    todosOsCircuitos: 'Todos os circuitos →',
    carros: 'A evolução dos carros →',
    faltam: (n: number) => `Buscando o restante das temporadas: faltam ${n}.`,
    maiores: 'Maiores campeões',
    pilotos: 'Pilotos',
    anoAAno: 'Campeões ano a ano',
    decadas: 'Décadas',
    anos: (decada: number) => `Anos ${String(decada).slice(2)}`,
  },
  en: {
    titulos: ' titles',
    construtores: 'Constructors',
    aindaNaoHavia: 'Not awarded yet',
    carregando: 'Loading the history…',
    erro: 'Could not load the history',
    titulo: 'F1 history',
    resumo:
      'Every champion since 1950. Open a year to see the standings, the teams and every race of that season.',
    dicionario: 'Dictionary',
    todosOsPilotos: 'All drivers →',
    todasAsEquipes: 'All teams →',
    todosOsCircuitos: 'All circuits →',
    carros: 'How the cars evolved →',
    faltam: (n: number) => `Fetching the remaining seasons: ${n} to go.`,
    maiores: 'Greatest champions',
    pilotos: 'Drivers',
    anoAAno: 'Champions year by year',
    decadas: 'Decades',
    anos: (decada: number) => `The ${decada}s`,
  },
};
import { pontos } from './numeros';

type Temporada = HistoriaDosCampeoesDTO['temporadas'][number];
type Recordista = HistoriaDosCampeoesDTO['maioresPilotos'][number];

function decadaDe(ano: number) {
  return Math.floor(ano / 10) * 10;
}

function Ranking({
  titulo,
  recordistas,
  pilotos = false,
}: {
  titulo: string;
  recordistas: Recordista[];
  pilotos?: boolean;
}) {
  const t = useTextos(TEXTOS);

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
                {pilotos ? <NomeDoPiloto nome={recordista.nome} /> : nomeDaEquipe(recordista.nome)}
              </span>
              <span className={styles.anosDeTitulo}>{recordista.anos.join(' · ')}</span>
            </span>
            <span className={styles.titulos}>
              {recordista.titulos}
              <span className="apenas-leitor">{t.titulos}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Ano({ temporada }: { temporada: Temporada }) {
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

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
            {comuns.vitorias(temporada.vitorias)}
          </span>
        </span>
        <span className={styles.construtor}>
          <span className={styles.rotuloDoConstrutor}>{t.construtores}</span>
          {temporada.construtor ? nomeDaEquipe(temporada.construtor.nome) : t.aindaNaoHavia}
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
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  if (historia.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (historia.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => historia.refetch()}>
            {comuns.tentarDeNovo}
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
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo}</p>
        <nav aria-label={t.dicionario} className={styles.atalhos}>
          <Link to="/historia/pilotos">{t.todosOsPilotos}</Link>
          <Link to="/equipes">{t.todasAsEquipes}</Link>
          <Link to="/circuitos">{t.todosOsCircuitos}</Link>
          <Link to="/historia/carros">{t.carros}</Link>
        </nav>
        {faltando > 0 && (
          <p className={styles.carregando} role="status">
            {t.faltam(faltando)}
          </p>
        )}
      </header>

      {temporadas.length > 0 && <LinhaDoTempo temporadas={temporadas} />}

      {temporadas.length > 0 && (
        <section aria-labelledby="maiores-campeoes" className={styles.secao}>
          <h2 id="maiores-campeoes" className={styles.tituloDaSecao}>
            {t.maiores}
          </h2>
          <div className={styles.rankings}>
            <Ranking titulo={t.pilotos} recordistas={maioresPilotos} pilotos />
            <Ranking titulo={t.construtores} recordistas={maioresConstrutores} />
          </div>
        </section>
      )}

      <section aria-labelledby="ano-a-ano" className={styles.secao}>
        <h2 id="ano-a-ano" className={styles.tituloDaSecao}>
          {t.anoAAno}
        </h2>
        <nav aria-label={t.decadas} className={styles.decadas}>
          {[...decadas.keys()].map((decada) => (
            <a key={decada} href={`#decada-${decada}`} className={styles.decada}>
              {decada}
            </a>
          ))}
        </nav>
        {[...decadas].map(([decada, anos]) => (
          <section key={decada} id={`decada-${decada}`} className={styles.grupo}>
            <h3 className={styles.tituloDaDecada}>{t.anos(decada)}</h3>
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
