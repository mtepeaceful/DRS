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
import { NomeDoPiloto } from '../pilotos-da-historia/NomeDoPiloto';
import styles from './TemporadaHistoricaPage.module.css';
import { porIdioma, useTextos } from '../../shared/i18n/idioma';

const TEXTOS = {
  pt: {
    classificacaoDePilotos: 'Classificação de pilotos',
    piloto: 'Piloto',
    vit: 'Vit',
    construtores: 'Construtores',
    soEm: (ano: number) => `O campeonato de construtores só começou em ${ano}.`,
    semConstrutores: 'Sem classificação de construtores para esta temporada.',
    equipe: 'Equipe',
    corridas: 'Corridas',
    vencedor: 'Vencedor: ',
    semResultado: 'Sem resultado registrado',
    historia: '← História',
    carregando: 'Carregando a temporada…',
    foraDoHistorico: 'Temporada fora do histórico',
    erro: 'Não foi possível carregar a temporada',
    voltar: 'Voltar à história',
    escolha: (ultimo: number) =>
      `Escolha um ano entre 1950 e ${ultimo}. A temporada atual fica no calendário.`,
    temporada: 'Temporada',
    nCorridas: (n: number) => `${n} ${n === 1 ? 'corrida' : 'corridas'}`,
    campeao: (pts: string, vitorias: number) =>
      `Campeão com ${pts} pontos e ${vitorias} ${vitorias === 1 ? 'vitória' : 'vitórias'}`,
    construtoresDoAno: 'Construtores',
    outras: 'Outras temporadas',
  },
  en: {
    classificacaoDePilotos: 'Drivers’ standings',
    piloto: 'Driver',
    vit: 'W',
    construtores: 'Constructors',
    soEm: (ano: number) => `The constructors’ championship only started in ${ano}.`,
    semConstrutores: 'No constructors’ standings for this season.',
    equipe: 'Team',
    corridas: 'Races',
    vencedor: 'Winner: ',
    semResultado: 'No result on record',
    historia: '← History',
    carregando: 'Loading the season…',
    foraDoHistorico: 'Season outside the archive',
    erro: 'Could not load the season',
    voltar: 'Back to history',
    escolha: (ultimo: number) =>
      `Pick a year between 1950 and ${ultimo}. The current season is on the calendar.`,
    temporada: 'Season',
    nCorridas: (n: number) => `${n} ${n === 1 ? 'race' : 'races'}`,
    campeao: (pts: string, vitorias: number) =>
      `Champion with ${pts} points and ${vitorias} ${vitorias === 1 ? 'win' : 'wins'}`,
    construtoresDoAno: 'Constructors',
    outras: 'Other seasons',
  },
};

const PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES = 1958;
const dataCurta = porIdioma(
  (locale) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    }),
);

function Pilotos({ pilotos }: { pilotos: TemporadaHistoricaDTO['pilotos'] }) {
  const t = useTextos(TEXTOS);

  return (
    <section className={styles.cartao} aria-labelledby="pilotos">
      <h2 id="pilotos" className={styles.tituloDoCartao}>
        {t.classificacaoDePilotos}
      </h2>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th scope="col" className={styles.numero}>
              Pos
            </th>
            <th scope="col">{t.piloto}</th>
            <th scope="col" className={styles.numero}>
              {t.vit}
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
                  <NomeDoPiloto nome={piloto.nome} />
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
  const t = useTextos(TEXTOS);

  return (
    <section className={styles.cartao} aria-labelledby="construtores">
      <h2 id="construtores" className={styles.tituloDoCartao}>
        {t.construtores}
      </h2>
      {construtores.length === 0 ? (
        <p className={styles.detalhe}>
          {ano < PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES
            ? t.soEm(PRIMEIRO_CAMPEONATO_DE_CONSTRUTORES)
            : t.semConstrutores}
        </p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th scope="col" className={styles.numero}>
                Pos
              </th>
              <th scope="col">{t.equipe}</th>
              <th scope="col" className={styles.numero}>
                {t.vit}
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
  const t = useTextos(TEXTOS);

  return (
    <section className={styles.cartao} aria-labelledby="corridas">
      <h2 id="corridas" className={styles.tituloDoCartao}>
        {t.corridas}
      </h2>
      <ol className={styles.corridas}>
        {corridas.map((corrida) => (
          <li key={corrida.rodada} className={styles.corrida}>
            <span className={styles.rodada}>{String(corrida.rodada).padStart(2, '0')}</span>
            <time dateTime={corrida.data} className={styles.data}>
              {dataCurta().format(new Date(corrida.data)).replace('.', '')}
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
                  <span className="apenas-leitor">{t.vencedor}</span>
                  <NomeDoPiloto nome={corrida.vencedor.nome} />
                  <span className={styles.detalhe}>{nomeDaEquipe(corrida.vencedor.equipe)}</span>
                </>
              ) : (
                <span className={styles.detalhe}>{t.semResultado}</span>
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
  const t = useTextos(TEXTOS);

  const voltar = (
    <Link to="/historia" className={styles.voltar} viewTransition>
      {t.historia}
    </Link>
  );

  if (temporada.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">{t.carregando}</span>
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
        titulo={inexistente ? t.foraDoHistorico : t.erro}
        acao={
          <Link to="/historia" className={botao.secundario}>
            {t.voltar}
          </Link>
        }
      >
        {inexistente ? t.escolha(ultimoAno) : mensagemDoErro(temporada.error)}
      </Aviso>
    );
  }

  const { pilotos, construtores, corridas } = temporada.data;
  const [campeao] = pilotos;
  const [equipeCampea] = construtores;

  return (
    <>
      <title>{`${t.temporada} ${ano} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <p className={styles.sobretitulo}>
          {t.temporada} {ano} · {t.nCorridas(corridas.length)}
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
          {t.campeao(pontos(campeao?.pontos ?? 0), campeao?.vitorias ?? 0)}
          {equipeCampea && (
            <>
              . {t.construtoresDoAno}: {nomeDaEquipe(equipeCampea.nome)}
            </>
          )}
          .
        </p>
        <nav aria-label={t.outras} className={styles.vizinhas}>
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
