import type { DesempenhoDoPilotoDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe, nomeDoGp } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { calendario } from '../calendario/api';
import { CORES_NEUTRAS } from '../calendario/cores';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { desempenhoDaTemporada } from './api';
import { confronto, type Placar, pontosAcumulados } from './comparacao';
import styles from './ComparacaoPage.module.css';
import { GraficoDePontos } from './GraficoDePontos';
import { COMUNS } from '../../shared/i18n/comuns';
import { idiomaAtual, porIdioma, useTextos } from '../../shared/i18n/idioma';

const COR_A = 'var(--cor-piloto-a)';
const COR_B = 'var(--cor-piloto-b)';

const decimal = porIdioma((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }));

type Piloto = DesempenhoDoPilotoDTO;

interface Metrica {
  rotulo: string;
  valor: (piloto: Piloto) => number | null;
  formatar?: (valor: number) => string;
  menorEhMelhor?: boolean;
  semVencedor?: boolean;
}

const TEXTOS = {
  pt: {
    posicao: 'Posição no campeonato',
    pontos: 'Pontos',
    vitorias: 'Vitórias',
    podios: 'Pódios',
    poles: 'Largadas na pole',
    melhor: 'Melhor resultado',
    media: 'Média de chegada',
    abandonos: 'Abandonos',
    corridas: 'Corridas disputadas',
    numeros: 'Números da temporada',
    estatistica: 'Estatística',
    carregando: '{t.carregando}',
    erro: 'Não foi possível carregar a temporada',
    semCorridas: 'Ainda não há corridas para comparar',
    verCalendario: 'Ver o calendário',
    aparece: 'A comparação aparece assim que a primeira corrida da temporada terminar.',
    etapa: (rodada: number) => `Etapa ${rodada}`,
    titulo: 'Comparar pilotos',
    resumo: (ano: number, n: number) =>
      `Temporada ${ano}, depois de ${n} ${n === 1 ? 'etapa' : 'etapas'}.`,
    comparados: 'Pilotos comparados',
    pilotoA: 'Piloto A',
    pilotoB: 'Piloto B',
    trocar: 'Trocar os lados',
    frente: 'Frente a frente',
    quem: 'Quem terminou à frente nas etapas que os dois disputaram.',
    naCorrida: 'Na corrida',
    noGrid: 'No grid de largada',
    acumulados: 'Pontos acumulados',
    legenda: 'Legenda',
    tabela: 'Ver os dados em tabela',
    coluna: 'Etapa',
  },
  en: {
    posicao: 'Championship position',
    pontos: 'Points',
    vitorias: 'Wins',
    podios: 'Podiums',
    poles: 'Pole positions',
    melhor: 'Best result',
    media: 'Average finish',
    abandonos: 'Retirements',
    corridas: 'Races started',
    numeros: 'Season numbers',
    estatistica: 'Statistic',
    carregando: 'Loading the season…',
    erro: 'Could not load the season',
    semCorridas: 'No races to compare yet',
    verCalendario: 'See the calendar',
    aparece: 'The comparison shows up as soon as the first race of the season is over.',
    etapa: (rodada: number) => `Round ${rodada}`,
    titulo: 'Compare drivers',
    resumo: (ano: number, n: number) =>
      `${ano} season, after ${n} ${n === 1 ? 'round' : 'rounds'}.`,
    comparados: 'Drivers compared',
    pilotoA: 'Driver A',
    pilotoB: 'Driver B',
    trocar: 'Swap sides',
    frente: 'Head to head',
    quem: 'Who finished ahead in the rounds both of them took part in.',
    naCorrida: 'In the race',
    noGrid: 'On the starting grid',
    acumulados: 'Points over the season',
    legenda: 'Legend',
    tabela: 'See the data as a table',
    coluna: 'Round',
  },
};

const ordinal = (valor: number) =>
  idiomaAtual() === 'en' ? `P${decimal().format(valor)}` : `${decimal().format(valor)}º`;

function metricas(): Metrica[] {
  const t = TEXTOS[idiomaAtual()];

  return [
    { rotulo: t.posicao, valor: (p) => p.posicao, formatar: ordinal, menorEhMelhor: true },
    { rotulo: t.pontos, valor: (p) => p.pontos },
    { rotulo: t.vitorias, valor: (p) => p.vitorias },
    { rotulo: t.podios, valor: (p) => p.podios },
    { rotulo: t.poles, valor: (p) => p.poles },
    { rotulo: t.melhor, valor: (p) => p.melhorResultado, formatar: ordinal, menorEhMelhor: true },
    { rotulo: t.media, valor: (p) => p.mediaDeChegada, formatar: ordinal, menorEhMelhor: true },
    { rotulo: t.abandonos, valor: (p) => p.abandonos, menorEhMelhor: true },
    { rotulo: t.corridas, valor: (p) => p.corridas, semVencedor: true },
  ];
}

function vencedor(metrica: Metrica, a: Piloto, b: Piloto) {
  const va = metrica.valor(a);
  const vb = metrica.valor(b);

  if (metrica.semVencedor || va === vb) {
    return null;
  }

  if (va === null || vb === null) {
    return va === null ? 'b' : 'a';
  }

  return va < vb === Boolean(metrica.menorEhMelhor) ? 'a' : 'b';
}

function Escolha({
  rotulo,
  cor,
  piloto,
  pilotos,
  outro,
  aoEscolher,
}: {
  rotulo: string;
  cor: string;
  piloto: Piloto;
  pilotos: Piloto[];
  outro: string;
  aoEscolher: (nome: string) => void;
}) {
  return (
    <div className={styles.escolha} style={{ borderTopColor: cor }}>
      <label className={styles.rotuloDaEscolha}>
        {rotulo}
        <select
          className={styles.seletor}
          value={piloto.nome}
          onChange={(evento) => aoEscolher(evento.target.value)}
        >
          {pilotos
            .filter((opcao) => opcao.nome !== outro)
            .map((opcao) => (
              <option key={opcao.nome} value={opcao.nome}>
                {opcao.posicao}º · {opcao.nome}
              </option>
            ))}
        </select>
      </label>
      <div className={styles.identidade}>
        <SimboloDaEquipe nome={piloto.equipe} {...CORES_NEUTRAS} tamanho="grande" />
        <p className={styles.nome}>{piloto.nome}</p>
        <p className={styles.equipe}>{nomeDaEquipe(piloto.equipe)}</p>
      </div>
    </div>
  );
}

function Duelo({
  titulo,
  placar,
  nomeA,
  nomeB,
}: {
  titulo: string;
  placar: Placar;
  nomeA: string;
  nomeB: string;
}) {
  const total = placar.a + placar.b;

  return (
    <div className={styles.duelo}>
      <p className={styles.tituloDoDuelo}>{titulo}</p>
      <div className={styles.placar}>
        <span className={styles.numeroDoPlacar}>{placar.a}</span>
        <span className={styles.barra} aria-hidden="true">
          {total > 0 ? (
            <>
              <span style={{ flexGrow: placar.a, background: COR_A }} />
              <span style={{ flexGrow: placar.b, background: COR_B }} />
            </>
          ) : (
            <span className={styles.barraVazia} />
          )}
        </span>
        <span className={styles.numeroDoPlacar}>{placar.b}</span>
      </div>
      <p className="apenas-leitor">
        {nomeA} {placar.a}, {nomeB} {placar.b}
      </p>
    </div>
  );
}

function Numeros({ a, b }: { a: Piloto; b: Piloto }) {
  const t = useTextos(TEXTOS);

  return (
    <table className={styles.numeros}>
      <caption className="apenas-leitor">{t.numeros}</caption>
      <thead className="apenas-leitor">
        <tr>
          <th scope="col">{a.nome}</th>
          <th scope="col">{t.estatistica}</th>
          <th scope="col">{b.nome}</th>
        </tr>
      </thead>
      <tbody>
        {metricas().map((metrica) => {
          const melhor = vencedor(metrica, a, b);
          const exibir = (piloto: Piloto) => {
            const valor = metrica.valor(piloto);

            return valor === null
              ? '—'
              : (metrica.formatar ?? ((numero: number) => decimal().format(numero)))(valor);
          };

          return (
            <tr key={metrica.rotulo}>
              <td className={melhor === 'a' ? styles.melhorA : styles.valor}>{exibir(a)}</td>
              <th scope="row" className={styles.metrica}>
                {metrica.rotulo}
              </th>
              <td className={melhor === 'b' ? styles.melhorB : styles.valor}>{exibir(b)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ComparacaoPage() {
  const [parametros, setParametros] = useSearchParams();
  const desempenho = useQuery(desempenhoDaTemporada);
  const etapas = useQuery(calendario);
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  if (desempenho.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (desempenho.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => desempenho.refetch()}>
            {comuns.tentarDeNovo}
          </button>
        }
      >
        {mensagemDoErro(desempenho.error)}
      </Aviso>
    );
  }

  const { ano, rodadasDisputadas, pilotos } = desempenho.data;

  if (pilotos.length < 2) {
    return (
      <Aviso
        titulo={t.semCorridas}
        acao={
          <Link to="/calendario" className={botao.secundario}>
            {t.verCalendario}
          </Link>
        }
      >
        {t.aparece}
      </Aviso>
    );
  }

  const buscarPiloto = (nome: string | null) => pilotos.find((piloto) => piloto.nome === nome);
  const a = buscarPiloto(parametros.get('a')) ?? (pilotos[0] as Piloto);
  const b =
    [buscarPiloto(parametros.get('b')), ...pilotos].find(
      (piloto): piloto is Piloto => piloto !== undefined && piloto.nome !== a.nome,
    ) ?? a;
  const { corridas, largadas } = confronto(a, b);
  const nomesDasEtapas = new Map(etapas.data?.map((etapa) => [etapa.rodada, nomeDoGp(etapa.nome)]));
  const nomeDaEtapa = (rodada: number) => nomesDasEtapas.get(rodada) ?? t.etapa(rodada);
  const pontosA = pontosAcumulados(a, rodadasDisputadas);
  const pontosB = pontosAcumulados(b, rodadasDisputadas);

  function escolher(chave: 'a' | 'b', nome: string) {
    setParametros({ a: a.nome, b: b.nome, [chave]: nome }, { replace: true });
  }

  return (
    <>
      <title>{`${a.nome} x ${b.nome} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo(ano, rodadasDisputadas)}</p>
      </header>

      <section className={styles.escolhas} aria-label={t.comparados}>
        <Escolha
          rotulo={t.pilotoA}
          cor={COR_A}
          piloto={a}
          pilotos={pilotos}
          outro={b.nome}
          aoEscolher={(nome) => escolher('a', nome)}
        />
        <button
          type="button"
          className={styles.trocar}
          onClick={() => setParametros({ a: b.nome, b: a.nome }, { replace: true })}
        >
          <span aria-hidden="true">⇄</span>
          <span className="apenas-leitor">{t.trocar}</span>
        </button>
        <Escolha
          rotulo={t.pilotoB}
          cor={COR_B}
          piloto={b}
          pilotos={pilotos}
          outro={a.nome}
          aoEscolher={(nome) => escolher('b', nome)}
        />
      </section>

      <section className={styles.cartao} aria-labelledby="frente-a-frente">
        <h2 id="frente-a-frente" className={styles.tituloDoCartao}>
          {t.frente}
        </h2>
        <p className={styles.detalhe}>{t.quem}</p>
        <Duelo titulo={t.naCorrida} placar={corridas} nomeA={a.nome} nomeB={b.nome} />
        <Duelo titulo={t.noGrid} placar={largadas} nomeA={a.nome} nomeB={b.nome} />
      </section>

      <section className={styles.cartao} aria-labelledby="numeros">
        <h2 id="numeros" className={styles.tituloDoCartao}>
          {t.numeros}
        </h2>
        <Numeros a={a} b={b} />
      </section>

      <section className={styles.cartao} aria-labelledby="pontos">
        <h2 id="pontos" className={styles.tituloDoCartao}>
          {t.acumulados}
        </h2>
        <ul className={styles.legenda} aria-label={t.legenda}>
          {[
            { nome: a.nome, cor: COR_A },
            { nome: b.nome, cor: COR_B },
          ].map((item) => (
            <li key={item.nome}>
              <span className={styles.amostra} style={{ background: item.cor }} />
              {item.nome}
            </li>
          ))}
        </ul>
        <GraficoDePontos
          series={[
            { nome: a.nome, cor: COR_A, valores: pontosA },
            { nome: b.nome, cor: COR_B, valores: pontosB },
          ]}
          nomeDaEtapa={nomeDaEtapa}
        />
        <details className={styles.tabela}>
          <summary>{t.tabela}</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">{t.coluna}</th>
                <th scope="col">{a.nome}</th>
                <th scope="col">{b.nome}</th>
              </tr>
            </thead>
            <tbody>
              {pontosA.map((total, indice) => (
                <tr key={indice}>
                  <th scope="row">{nomeDaEtapa(indice + 1)}</th>
                  <td>{total}</td>
                  <td>{pontosB[indice]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
    </>
  );
}
