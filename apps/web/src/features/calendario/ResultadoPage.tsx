import type { ResultadoDaEtapaDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import {
  codigoDoPais,
  nomeDaEquipe,
  nomeDoGp,
  nomeDoPaisEmPortugues,
} from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { resultadoDaEtapa } from './api';
import { CORES_NEUTRAS } from './cores';
import { Podio } from './Podio';
import styles from './ResultadoPage.module.css';
import { porIdioma, useIdioma, useTextos } from '../../shared/i18n/idioma';

type Linha = ResultadoDaEtapaDTO['classificacao'][number];
type LinhaDaQualificacao = ResultadoDaEtapaDTO['qualificacao'][number];
type Sessao = 'corrida' | 'sprint' | 'classificacao';

const TEXTOS = {
  pt: {
    sessoes: { corrida: 'Corrida', sprint: 'Sprint', classificacao: 'Classificação' } as Record<
      Sessao,
      string
    >,
    box: 'Box',
    ganhou: ' posições ganhas',
    perdeu: ' posições perdidas',
    piloto: 'Piloto',
    largada: 'Largada',
    voltas: 'Voltas',
    tempo: 'Tempo',
    naoClassificado: 'Não classificado',
    nc: 'NC',
    voltaRapida: 'Volta mais rápida',
    vr: 'VR',
    vrLegenda: 'VR: volta mais rápida',
    ncLegenda: 'NC: não classificado',
    pontos: 'Como funcionam os pontos',
    paraACorrida: 'Classificação para a corrida',
    melhorVolta: 'Melhor volta',
    calendario: '← Calendário',
    carregando: 'Carregando resultado…',
    naoEncontrada: 'Etapa não encontrada',
    erro: 'Não foi possível carregar o resultado',
    voltarAoCalendario: 'Voltar ao calendário',
    foraDoCalendario: 'Essa etapa não faz parte do calendário.',
    etapa: 'Etapa',
    sessoesDoFimDeSemana: 'Sessões do fim de semana',
    aindaNao: 'Essa corrida ainda não aconteceu',
    largadaMarcada: (quando: string) =>
      `A largada está marcada para ${quando}, no seu horário. A classificação aparece aqui assim que a prova terminar.`,
    podio: 'Pódio',
    finalDaCorrida: 'Classificação final da corrida',
    daSprint: 'Resultado da sprint',
  },
  en: {
    sessoes: { corrida: 'Race', sprint: 'Sprint', classificacao: 'Qualifying' } as Record<
      Sessao,
      string
    >,
    box: 'Pit lane',
    ganhou: ' places gained',
    perdeu: ' places lost',
    piloto: 'Driver',
    largada: 'Grid',
    voltas: 'Laps',
    tempo: 'Time',
    naoClassificado: 'Not classified',
    nc: 'NC',
    voltaRapida: 'Fastest lap',
    vr: 'FL',
    vrLegenda: 'FL: fastest lap',
    ncLegenda: 'NC: not classified',
    pontos: 'How points work',
    paraACorrida: 'Qualifying for the race',
    melhorVolta: 'Best lap',
    calendario: '← Calendar',
    carregando: 'Loading the result…',
    naoEncontrada: 'Round not found',
    erro: 'Could not load the result',
    voltarAoCalendario: 'Back to the calendar',
    foraDoCalendario: 'This round is not on the calendar.',
    etapa: 'Round',
    sessoesDoFimDeSemana: 'Weekend sessions',
    aindaNao: 'This race has not happened yet',
    largadaMarcada: (quando: string) =>
      `The start is set for ${quando}, in your time zone. The result shows up here as soon as the race ends.`,
    podio: 'Podium',
    finalDaCorrida: 'Final race classification',
    daSprint: 'Sprint result',
  },
};

function ordinal(posicao: number, idioma: 'pt' | 'en') {
  if (idioma === 'pt') return `${posicao}º`;

  return `P${posicao}`;
}

const dataDaCorrida = porIdioma((locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }));
const dataEHora = porIdioma(
  (locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }),
);

function Largada({ linha }: { linha: Linha }) {
  const t = useTextos(TEXTOS);
  const idioma = useIdioma();

  if (linha.largada === 0) {
    return <span className={styles.largada}>{t.box}</span>;
  }

  const ganho = linha.largada - linha.posicao;

  if (!linha.classificado || ganho === 0) {
    return <span className={styles.largada}>{ordinal(linha.largada, idioma)}</span>;
  }

  return (
    <span className={styles.largada}>
      {ordinal(linha.largada, idioma)}{' '}
      <span className={ganho > 0 ? styles.subiu : styles.caiu}>
        <span aria-hidden="true">{ganho > 0 ? '▲' : '▼'}</span>
        {Math.abs(ganho)}
        <span className="apenas-leitor">{ganho > 0 ? t.ganhou : t.perdeu}</span>
      </span>
    </span>
  );
}

function Classificacao({ linhas, legenda }: { linhas: Linha[]; legenda: string }) {
  const t = useTextos(TEXTOS);

  return (
    <>
      <div className={styles.cartao}>
        <table className={styles.tabela}>
          <caption className="apenas-leitor">{legenda}</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.colunaPosicao}>
                Pos
              </th>
              <th scope="col">{t.piloto}</th>
              <th scope="col" className={styles.opcional}>
                {t.largada}
              </th>
              <th scope="col" className={styles.opcional}>
                {t.voltas}
              </th>
              <th scope="col">{t.tempo}</th>
              <th scope="col" className={styles.colunaPontos}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr
                key={linha.numero}
                className={linha.classificado ? undefined : styles.foraDaProva}
              >
                <td className={styles.colunaPosicao}>
                  {linha.classificado ? (
                    linha.posicao
                  ) : (
                    <abbr title={t.naoClassificado}>{t.nc}</abbr>
                  )}
                </td>
                <th scope="row" className={styles.colunaPiloto}>
                  <span className={styles.piloto}>
                    <SimboloDaEquipe nome={linha.equipe} {...CORES_NEUTRAS} />
                    <span className={styles.nomeDoPiloto}>
                      <span>
                        {linha.nome}
                        {linha.voltaMaisRapida && (
                          <span className={styles.voltaRapida} title={t.voltaRapida}>
                            <span aria-hidden="true">{t.vr}</span>
                            <span className="apenas-leitor"> ({t.voltaRapida})</span>
                          </span>
                        )}
                      </span>
                      <span className={styles.equipe}>
                        #{linha.numero} · {nomeDaEquipe(linha.equipe)}
                      </span>
                    </span>
                  </span>
                </th>
                <td className={styles.opcional}>
                  <Largada linha={linha} />
                </td>
                <td className={styles.opcional}>{linha.voltas}</td>
                <td className={styles.tempo}>
                  {linha.tempo ?? <span className={styles.situacao}>{linha.situacao}</span>}
                </td>
                <td className={styles.colunaPontos}>{linha.pontos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.siglas}>
        <Link to="/glossario#volta-mais-rapida">{t.vrLegenda}</Link>
        <Link to="/glossario#nao-classificado">{t.ncLegenda}</Link>
        <Link to="/glossario#pontuacao">{t.pontos}</Link>
      </p>
    </>
  );
}

function melhorTempo(linha: LinhaDaQualificacao) {
  if (linha.q3) return `${linha.q3} · Q3`;
  if (linha.q2) return `${linha.q2} · Q2`;

  return linha.q1 ? `${linha.q1} · Q1` : '—';
}

function Qualificacao({ linhas }: { linhas: LinhaDaQualificacao[] }) {
  const t = useTextos(TEXTOS);

  return (
    <div className={styles.cartao}>
      <table className={styles.tabela}>
        <caption className="apenas-leitor">{t.paraACorrida}</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.colunaPosicao}>
              Pos
            </th>
            <th scope="col">{t.piloto}</th>
            <th scope="col" className={styles.opcional}>
              Q1
            </th>
            <th scope="col" className={styles.opcional}>
              Q2
            </th>
            <th scope="col" className={styles.opcional}>
              Q3
            </th>
            <th scope="col" className={styles.soNoCelular}>
              {t.melhorVolta}
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.numero}>
              <td className={styles.colunaPosicao}>{linha.posicao}</td>
              <th scope="row" className={styles.colunaPiloto}>
                <span className={styles.piloto}>
                  <SimboloDaEquipe nome={linha.equipe} {...CORES_NEUTRAS} />
                  <span className={styles.nomeDoPiloto}>
                    {linha.nome}
                    <span className={styles.equipe}>
                      #{linha.numero} · {nomeDaEquipe(linha.equipe)}
                    </span>
                  </span>
                </span>
              </th>
              {[linha.q1, linha.q2, linha.q3].map((tempo, indice) => (
                <td key={indice} className={`${styles.opcional} ${styles.tempo}`}>
                  {tempo ?? <span className={styles.situacao}>—</span>}
                </td>
              ))}
              <td className={`${styles.soNoCelular} ${styles.tempo}`}>{melhorTempo(linha)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultadoPage() {
  const { rodada = '' } = useParams();
  const [parametros] = useSearchParams();
  const resultado = useQuery(resultadoDaEtapa(rodada));
  const t = useTextos(TEXTOS);

  const voltar = (
    <Link to="/calendario" className={styles.voltar} viewTransition>
      {t.calendario}
    </Link>
  );

  if (resultado.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">{t.carregando}</span>
        </div>
      </>
    );
  }

  if (resultado.isError) {
    const inexistente =
      resultado.error instanceof ErroDaApi && [400, 404].includes(resultado.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? t.naoEncontrada : t.erro}
        acao={
          <Link to="/calendario" className={botao.secundario}>
            {t.voltarAoCalendario}
          </Link>
        }
      >
        {inexistente ? t.foraDoCalendario : mensagemDoErro(resultado.error)}
      </Aviso>
    );
  }

  const { etapa, classificacao, sprint, qualificacao } = resultado.data;
  const titulo = nomeDoGp(etapa.nome);
  const podio = classificacao.filter((linha) => linha.classificado && linha.posicao <= 3);
  const disponiveis = (
    [
      ['corrida', classificacao.length],
      ['sprint', sprint.length],
      ['classificacao', qualificacao.length],
    ] as const
  )
    .filter(([, linhas]) => linhas > 0)
    .map(([sessao]) => sessao);
  const pedida = parametros.get('sessao');
  const sessao = disponiveis.find((disponivel) => disponivel === pedida) ?? disponiveis[0];

  return (
    <>
      <title>{`${titulo} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <p className={styles.sobretitulo}>
          {t.etapa} {etapa.rodada} · {dataDaCorrida().format(new Date(etapa.inicio))}
        </p>
        <h1 className={styles.nomeDoGp}>{titulo}</h1>
        <p className={styles.local}>
          <Bandeira pais={codigoDoPais(etapa.pais)} />
          <span>
            <Link to={`/circuitos/${etapa.circuitoId}`} className={styles.circuito}>
              {etapa.circuito}
            </Link>{' '}
            · {etapa.cidade}, {nomeDoPaisEmPortugues(etapa.pais)}
          </span>
        </p>
      </header>

      {disponiveis.length > 1 && (
        <nav aria-label={t.sessoesDoFimDeSemana} className={styles.sessoes}>
          {disponiveis.map((opcao) => (
            <Link
              key={opcao}
              to={`?sessao=${opcao}`}
              replace
              preventScrollReset
              className={opcao === sessao ? styles.sessaoAtiva : styles.sessao}
              aria-current={opcao === sessao ? 'page' : undefined}
            >
              {t.sessoes[opcao]}
            </Link>
          ))}
        </nav>
      )}

      {sessao === undefined && (
        <Aviso titulo={t.aindaNao}>
          {t.largadaMarcada(dataEHora().format(new Date(etapa.inicio)))}
        </Aviso>
      )}

      {sessao === 'corrida' && (
        <>
          {podio.length === 3 && (
            <section className={styles.secaoDoPodio} aria-label={t.podio}>
              <Podio pilotos={podio} />
            </section>
          )}
          <Classificacao linhas={classificacao} legenda={t.finalDaCorrida} />
        </>
      )}

      {sessao === 'sprint' && <Classificacao linhas={sprint} legenda={t.daSprint} />}

      {sessao === 'classificacao' && <Qualificacao linhas={qualificacao} />}
    </>
  );
}
