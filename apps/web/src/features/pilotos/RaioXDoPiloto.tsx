import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { nomeDoGp } from '../../shared/lib/traducoes';
import { calendario } from '../calendario/api';
import { desempenhoDaTemporada } from '../comparar/api';
import { carreiraDoPiloto } from './api';
import styles from './RaioXDoPiloto.module.css';

const dataLonga = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });

function idade(nascimento: string, hoje = new Date()) {
  const data = new Date(nascimento);
  const anos = hoje.getUTCFullYear() - data.getUTCFullYear();
  const jaFezAniversario =
    hoje.getUTCMonth() > data.getUTCMonth() ||
    (hoje.getUTCMonth() === data.getUTCMonth() && hoje.getUTCDate() >= data.getUTCDate());

  return jaFezAniversario ? anos : anos - 1;
}

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

export function CarreiraDoPiloto({ id }: { id: string }) {
  const carreira = useQuery(carreiraDoPiloto(id));

  if (carreira.isPending) {
    return <div className={styles.esqueleto} role="status" aria-label="Carregando a carreira" />;
  }

  if (carreira.isError || !carreira.data) {
    return null;
  }

  const { nascimento, estreia, temporadas, corridas, vitorias, podios, poles, titulos } =
    carreira.data;
  const numeros = [
    { rotulo: 'Estreia', valor: estreia },
    { rotulo: 'Temporadas', valor: temporadas },
    { rotulo: 'Corridas', valor: corridas },
    { rotulo: 'Vitórias', valor: vitorias },
    { rotulo: 'Pódios', valor: podios },
    { rotulo: 'Largadas na pole', valor: poles },
  ];

  return (
    <section className={styles.cartao} aria-labelledby="carreira">
      <header className={styles.cabecalho}>
        <h2 id="carreira" className={styles.titulo}>
          Carreira na F1
        </h2>
        {nascimento && (
          <p className={styles.detalhe}>
            {idade(nascimento)} anos · nasceu em {dataLonga.format(new Date(nascimento))}
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
          <span className={styles.rotuloDosTitulos}>
            {plural(titulos.length, 'título mundial', 'títulos mundiais')}
          </span>
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
  const piloto = desempenho.data?.pilotos.find((candidato) => candidato.nome === nome);

  if (!desempenho.data || !piloto) {
    return null;
  }

  const nomes = new Map(etapas.data?.map((etapa) => [etapa.rodada, nomeDoGp(etapa.nome)]));

  return (
    <section className={styles.cartao} aria-labelledby="temporada">
      <header className={styles.cabecalho}>
        <h2 id="temporada" className={styles.titulo}>
          Temporada {desempenho.data.ano}
        </h2>
        <p className={styles.detalhe}>
          {piloto.posicao}º no campeonato · {piloto.pontos} pts ·{' '}
          {plural(piloto.vitorias, 'vitória', 'vitórias')} ·{' '}
          {plural(piloto.podios, 'pódio', 'pódios')}
        </p>
      </header>
      <table className={styles.tabela}>
        <caption className="apenas-leitor">Resultado em cada corrida da temporada</caption>
        <thead>
          <tr>
            <th scope="col">Corrida</th>
            <th scope="col" className={styles.numerico}>
              Largada
            </th>
            <th scope="col" className={styles.numerico}>
              Chegada
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
                  {nomes.get(etapa.rodada) ?? `Etapa ${etapa.rodada}`}
                </Link>
              </th>
              <td className={styles.numerico}>{etapa.largada > 0 ? `${etapa.largada}º` : 'Box'}</td>
              <td className={etapa.posicao === 1 ? styles.vitoria : styles.numerico}>
                {etapa.posicao === null ? (
                  <abbr title="Não classificado">NC</abbr>
                ) : (
                  `${etapa.posicao}º`
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
