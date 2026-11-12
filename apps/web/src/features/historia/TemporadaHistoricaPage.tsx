import type { TemporadaHistoricaDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
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
import { temporadaHistorica } from './api';
import { pontos } from './numeros';
import styles from './TemporadaHistoricaPage.module.css';

const PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES = 1958;
const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

function Pilotos({ pilotos }: { pilotos: TemporadaHistoricaDTO['pilotos'] }) {
  return (
    <section className={styles.cartao} aria-labelledby="pilotos">
      <h2 id="pilotos" className={styles.tituloDoCartao}>
        Classificação de pilotos
      </h2>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th scope="col" className={styles.numero}>
              Pos
            </th>
            <th scope="col">Piloto</th>
            <th scope="col" className={styles.numero}>
              Vit
            </th>
            <th scope="col" className={styles.numero}>
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {pilotos.map((piloto) => (
            <tr key={piloto.nome}>
              <td className={styles.posicao}>{piloto.posicao}</td>
              <th scope="row" className={styles.nome}>
                <span className={styles.comBandeira}>
                  {piloto.pais && <Bandeira pais={piloto.pais} />}
                  {piloto.nome}
                </span>
                <span className={styles.detalhe}>
                  {piloto.equipes.map(nomeDaEquipe).join(', ')}
                </span>
              </th>
              <td className={styles.numero}>{piloto.vitorias}</td>
              <td className={styles.pontos}>{pontos(piloto.pontos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Construtores({
  ano,
  construtores,
}: {
  ano: number;
  construtores: TemporadaHistoricaDTO['construtores'];
}) {
  return (
    <section className={styles.cartao} aria-labelledby="construtores">
      <h2 id="construtores" className={styles.tituloDoCartao}>
        Construtores
      </h2>
      {construtores.length === 0 ? (
        <p className={styles.detalhe}>
          {ano < PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES
            ? `O campeonato de construtores só começou em ${PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES}.`
            : 'Sem classificação de construtores para esta temporada.'}
        </p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th scope="col" className={styles.numero}>
                Pos
              </th>
              <th scope="col">Equipe</th>
              <th scope="col" className={styles.numero}>
                Vit
              </th>
              <th scope="col" className={styles.numero}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {construtores.map((equipe) => (
              <tr key={equipe.nome}>
                <td className={styles.posicao}>{equipe.posicao}</td>
                <th scope="row" className={styles.nome}>
                  {nomeDaEquipe(equipe.nome)}
                </th>
                <td className={styles.numero}>{equipe.vitorias}</td>
                <td className={styles.pontos}>{pontos(equipe.pontos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Corridas({ corridas }: { corridas: TemporadaHistoricaDTO['corridas'] }) {
  return (
    <section className={styles.cartao} aria-labelledby="corridas">
      <h2 id="corridas" className={styles.tituloDoCartao}>
        Corridas
      </h2>
      <ol className={styles.corridas}>
        {corridas.map((corrida) => (
          <li key={corrida.rodada} className={styles.corrida}>
            <span className={styles.rodada}>{String(corrida.rodada).padStart(2, '0')}</span>
            <time dateTime={corrida.data} className={styles.data}>
              {dataCurta.format(new Date(corrida.data)).replace('.', '')}
            </time>
            <span className={styles.gp}>
              <span className={styles.comBandeira}>
                <Bandeira pais={codigoDoPais(corrida.pais)} />
                {nomeDoGp(corrida.nome)}
              </span>
              <span className={styles.detalhe}>
                <Link to={`/circuitos/${corrida.circuitoId}`} className={styles.circuito}>
                  {corrida.circuito}
                </Link>{' '}
                · {nomeDoPaisEmPortugues(corrida.pais)}
              </span>
            </span>
            <span className={styles.vencedor}>
              {corrida.vencedor ? (
                <>
                  <span className="apenas-leitor">Vencedor: </span>
                  {corrida.vencedor.nome}
                  <span className={styles.detalhe}>{nomeDaEquipe(corrida.vencedor.equipe)}</span>
                </>
              ) : (
                <span className={styles.detalhe}>Sem resultado registrado</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TemporadaHistoricaPage() {
  const { ano = '' } = useParams();
  const temporada = useQuery(temporadaHistorica(ano));
  const numero = Number(ano);
  const ultimoAno = new Date().getFullYear() - 1;

  const voltar = (
    <Link to="/historia" className={styles.voltar} viewTransition>
      ← História
    </Link>
  );

  if (temporada.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando a temporada…</span>
        </div>
      </>
    );
  }

  if (temporada.isError) {
    const inexistente =
      temporada.error instanceof ErroDaApi && [400, 404].includes(temporada.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={
          inexistente ? 'Temporada fora do histórico' : 'Não foi possível carregar a temporada'
        }
        acao={
          <Link to="/historia" className={botao.secundario}>
            Voltar à história
          </Link>
        }
      >
        {inexistente
          ? `Escolha um ano entre 1950 e ${ultimoAno}. A temporada atual fica no calendário.`
          : mensagemDoErro(temporada.error)}
      </Aviso>
    );
  }

  const { pilotos, construtores, corridas } = temporada.data;
  const [campeao] = pilotos;
  const [equipeCampea] = construtores;

  return (
    <>
      <title>{`Temporada ${ano} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <p className={styles.sobretitulo}>
          Temporada {ano} · {corridas.length} {corridas.length === 1 ? 'corrida' : 'corridas'}
        </p>
        {campeao && (
          <h1 className={styles.titulo}>
            <span className={styles.comBandeira}>
              {campeao.pais && <Bandeira pais={campeao.pais} />}
              {campeao.nome}
            </span>
          </h1>
        )}
        <p className={styles.resumo}>
          Campeão com {pontos(campeao?.pontos ?? 0)} pontos e {campeao?.vitorias ?? 0}{' '}
          {campeao?.vitorias === 1 ? 'vitória' : 'vitórias'}
          {equipeCampea && <>. Construtores: {nomeDaEquipe(equipeCampea.nome)}</>}.
        </p>
        <nav aria-label="Outras temporadas" className={styles.vizinhas}>
          {numero > 1950 ? (
            <Link to={`/historia/${numero - 1}`} className={botao.secundario}>
              ← {numero - 1}
            </Link>
          ) : (
            <span />
          )}
          {numero < ultimoAno && (
            <Link to={`/historia/${numero + 1}`} className={botao.secundario}>
              {numero + 1} →
            </Link>
          )}
        </nav>
      </header>

      <div className={styles.colunas}>
        <Pilotos pilotos={pilotos} />
        <Construtores ano={numero} construtores={construtores} />
      </div>
      <Corridas corridas={corridas} />
    </>
  );
}
