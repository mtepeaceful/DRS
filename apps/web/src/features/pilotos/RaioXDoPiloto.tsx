import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { nomeDoGp } from '../../shared/lib/traducoes';
import { calendario } from '../calendario/api';
import { desempenhoDaTemporada } from '../comparar/api';
import { carreiraDoPiloto } from './api';
import styles from './RaioXDoPiloto.module.css';
import { porIdioma, useIdioma, useTextos } from '../../shared/i18n/idioma';

const TEXTOS = {
  pt: {
    carregando: 'Carregando a carreira',
    estreia: 'Estreia',
    temporadas: 'Temporadas',
    corridas: 'Corridas',
    vitorias: 'Vitórias',
    podios: 'Pódios',
    poles: 'Largadas na pole',
    carreira: 'Carreira na F1',
    idade: (anos: number, data: string) => `${anos} anos · nasceu em ${data}`,
    titulos: ['título mundial', 'títulos mundiais'],
    temporada: 'Temporada',
    noCampeonato: (posicao: number) => `${posicao}º no campeonato`,
    vitoria: ['vitória', 'vitórias'],
    podio: ['pódio', 'pódios'],
    legenda: 'Resultado em cada corrida da temporada',
    corrida: 'Corrida',
    largada: 'Largada',
    chegada: 'Chegada',
    etapa: 'Etapa',
    box: 'Box',
    naoClassificado: 'Não classificado',
  },
  en: {
    carregando: 'Loading the career',
    estreia: 'Debut',
    temporadas: 'Seasons',
    corridas: 'Races',
    vitorias: 'Wins',
    podios: 'Podiums',
    poles: 'Pole positions',
    carreira: 'F1 career',
    idade: (anos: number, data: string) => `${anos} years old · born on ${data}`,
    titulos: ['world title', 'world titles'],
    temporada: 'Season',
    noCampeonato: (posicao: number) => `P${posicao} in the championship`,
    vitoria: ['win', 'wins'],
    podio: ['podium', 'podiums'],
    legenda: 'Result in each race of the season',
    corrida: 'Race',
    largada: 'Grid',
    chegada: 'Finish',
    etapa: 'Round',
    box: 'Pit lane',
    naoClassificado: 'Not classified',
  },
};

const dataLonga = porIdioma(
  (locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }),
);

function idade(nascimento: string, hoje = new Date()) {
  const data = new Date(nascimento);
  const anos = hoje.getUTCFullYear() - data.getUTCFullYear();
  const jaFezAniversario =
    hoje.getUTCMonth() > data.getUTCMonth() ||
    (hoje.getUTCMonth() === data.getUTCMonth() && hoje.getUTCDate() >= data.getUTCDate());

  return jaFezAniversario ? anos : anos - 1;
}

function plural(quantidade: number, [singular = '', plural = '']: string[]) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

export function CarreiraDoPiloto({ id }: { id: string }) {
  const carreira = useQuery(carreiraDoPiloto(id));
  const t = useTextos(TEXTOS);

  if (carreira.isPending) {
    return <div className={styles.esqueleto} role="status" aria-label={t.carregando} />;
  }

  if (carreira.isError || !carreira.data) {
    return null;
  }

  const { nascimento, estreia, temporadas, corridas, vitorias, podios, poles, titulos } =
    carreira.data;
  const numeros = [
    { rotulo: t.estreia, valor: estreia },
    { rotulo: t.temporadas, valor: temporadas },
    { rotulo: t.corridas, valor: corridas },
    { rotulo: t.vitorias, valor: vitorias },
    { rotulo: t.podios, valor: podios },
    { rotulo: t.poles, valor: poles },
  ];

  return (
    <section className={styles.cartao} aria-labelledby="carreira">
      <header className={styles.cabecalho}>
        <h2 id="carreira" className={styles.titulo}>
          {t.carreira}
        </h2>
        {nascimento && (
          <p className={styles.detalhe}>
            {t.idade(idade(nascimento), dataLonga().format(new Date(nascimento)))}
          </p>
        )}
      </header>
      <dl className={styles.numeros}>
        {numeros.map((numero) => (
          <div key={numero.rotulo} className={styles.numero}>
            <dt>{numero.rotulo}</dt>
            <dd>{numero.valor}</dd>
          </div>
        ))}
      </dl>
      {titulos.length > 0 && (
        <p className={styles.titulos}>
          <span className={styles.rotuloDosTitulos}>{plural(titulos.length, t.titulos)}</span>
          {titulos.map((ano) => (
            <Link key={ano} to={`/historia/${ano}`} className={styles.ano}>
              {ano}
            </Link>
          ))}
        </p>
      )}
    </section>
  );
}

export function TemporadaDoPiloto({ nome }: { nome: string }) {
  const desempenho = useQuery(desempenhoDaTemporada);
  const etapas = useQuery(calendario);
  const t = useTextos(TEXTOS);
  const idioma = useIdioma();
  const posicao = (valor: number) => (idioma === 'en' ? `P${valor}` : `${valor}º`);
  const piloto = desempenho.data?.pilotos.find((candidato) => candidato.nome === nome);

  if (!desempenho.data || !piloto) {
    return null;
  }

  const nomes = new Map(etapas.data?.map((etapa) => [etapa.rodada, nomeDoGp(etapa.nome)]));

  return (
    <section className={styles.cartao} aria-labelledby="temporada">
      <header className={styles.cabecalho}>
        <h2 id="temporada" className={styles.titulo}>
          {t.temporada} {desempenho.data.ano}
        </h2>
        <p className={styles.detalhe}>
          {t.noCampeonato(piloto.posicao)} · {piloto.pontos} pts ·{' '}
          {plural(piloto.vitorias, t.vitoria)} · {plural(piloto.podios, t.podio)}
        </p>
      </header>
      <table className={styles.tabela}>
        <caption className="apenas-leitor">{t.legenda}</caption>
        <thead>
          <tr>
            <th scope="col">{t.corrida}</th>
            <th scope="col" className={styles.numerico}>
              {t.largada}
            </th>
            <th scope="col" className={styles.numerico}>
              {t.chegada}
            </th>
            <th scope="col" className={styles.numerico}>
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {piloto.etapas.map((etapa) => (
            <tr key={etapa.rodada}>
              <th scope="row" className={styles.corrida}>
                <Link to={`/calendario/${etapa.rodada}`}>
                  {nomes.get(etapa.rodada) ?? `${t.etapa} ${etapa.rodada}`}
                </Link>
              </th>
              <td className={styles.numerico}>
                {etapa.largada > 0 ? posicao(etapa.largada) : t.box}
              </td>
              <td className={etapa.posicao === 1 ? styles.vitoria : styles.numerico}>
                {etapa.posicao === null ? (
                  <abbr title={t.naoClassificado}>NC</abbr>
                ) : (
                  posicao(etapa.posicao)
                )}
              </td>
              <td className={styles.pontos}>{etapa.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
