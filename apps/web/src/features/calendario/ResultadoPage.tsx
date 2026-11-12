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

type Linha = ResultadoDaEtapaDTO['classificacao'][number];
type LinhaDaQualificacao = ResultadoDaEtapaDTO['qualificacao'][number];
type Sessao = 'corrida' | 'sprint' | 'classificacao';

const NOMES_DAS_SESSOES: Record<Sessao, string> = {
  corrida: 'Corrida',
  sprint: 'Sprint',
  classificacao: 'Classificação',
};

const dataDaCorrida = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });
const dataEHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

function Largada({ linha }: { linha: Linha }) {
  if (linha.largada === 0) {
    return <span className={styles.largada}>Box</span>;
  }

  const ganho = linha.largada - linha.posicao;

  if (!linha.classificado || ganho === 0) {
    return <span className={styles.largada}>{linha.largada}º</span>;
  }

  return (
    <span className={styles.largada}>
      {linha.largada}º{' '}
      <span className={ganho > 0 ? styles.subiu : styles.caiu}>
        <span aria-hidden="true">{ganho > 0 ? '▲' : '▼'}</span>
        {Math.abs(ganho)}
        <span className="apenas-leitor">
          {ganho > 0 ? ' posições ganhas' : ' posições perdidas'}
        </span>
      </span>
    </span>
  );
}

function Classificacao({ linhas, legenda }: { linhas: Linha[]; legenda: string }) {
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
              <th scope="col">Piloto</th>
              <th scope="col" className={styles.opcional}>
                Largada
              </th>
              <th scope="col" className={styles.opcional}>
                Voltas
              </th>
              <th scope="col">Tempo</th>
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
                  {linha.classificado ? linha.posicao : <abbr title="Não classificado">NC</abbr>}
                </td>
                <th scope="row" className={styles.colunaPiloto}>
                  <span className={styles.piloto}>
                    <SimboloDaEquipe nome={linha.equipe} {...CORES_NEUTRAS} />
                    <span className={styles.nomeDoPiloto}>
                      <span>
                        {linha.nome}
                        {linha.voltaMaisRapida && (
                          <span className={styles.voltaRapida} title="Volta mais rápida">
                            <span aria-hidden="true">VR</span>
                            <span className="apenas-leitor"> (volta mais rápida)</span>
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
        <Link to="/glossario#volta-mais-rapida">VR: volta mais rápida</Link>
        <Link to="/glossario#nao-classificado">NC: não classificado</Link>
        <Link to="/glossario#pontuacao">Como funcionam os pontos</Link>
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
  return (
    <div className={styles.cartao}>
      <table className={styles.tabela}>
        <caption className="apenas-leitor">Classificação para a corrida</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.colunaPosicao}>
              Pos
            </th>
            <th scope="col">Piloto</th>
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
              Melhor volta
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

  const voltar = (
    <Link to="/calendario" className={styles.voltar} viewTransition>
      ← Calendário
    </Link>
  );

  if (resultado.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando resultado…</span>
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
        titulo={inexistente ? 'Etapa não encontrada' : 'Não foi possível carregar o resultado'}
        acao={
          <Link to="/calendario" className={botao.secundario}>
            Voltar ao calendário
          </Link>
        }
      >
        {inexistente ? 'Essa etapa não faz parte do calendário.' : mensagemDoErro(resultado.error)}
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
          Etapa {etapa.rodada} · {dataDaCorrida.format(new Date(etapa.inicio))}
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
        <nav aria-label="Sessões do fim de semana" className={styles.sessoes}>
          {disponiveis.map((opcao) => (
            <Link
              key={opcao}
              to={`?sessao=${opcao}`}
              replace
              preventScrollReset
              className={opcao === sessao ? styles.sessaoAtiva : styles.sessao}
              aria-current={opcao === sessao ? 'page' : undefined}
            >
              {NOMES_DAS_SESSOES[opcao]}
            </Link>
          ))}
        </nav>
      )}

      {sessao === undefined && (
        <Aviso titulo="Essa corrida ainda não aconteceu">
          A largada está marcada para {dataEHora.format(new Date(etapa.inicio))}, no seu horário. A
          classificação aparece aqui assim que a prova terminar.
        </Aviso>
      )}

      {sessao === 'corrida' && (
        <>
          {podio.length === 3 && (
            <section className={styles.secaoDoPodio} aria-label="Pódio">
              <Podio pilotos={podio} />
            </section>
          )}
          <Classificacao linhas={classificacao} legenda="Classificação final da corrida" />
        </>
      )}

      {sessao === 'sprint' && <Classificacao linhas={sprint} legenda="Resultado da sprint" />}

      {sessao === 'classificacao' && <Qualificacao linhas={qualificacao} />}
    </>
  );
}
