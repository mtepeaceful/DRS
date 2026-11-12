import type { FichaDoCircuitoDTO } from '@drs/contracts';
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
import { fichaDoCircuito } from './api';
import styles from './FichaDoCircuitoPage.module.css';

const dataEHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

function Maiores({
  titulo,
  lista,
}: {
  titulo: string;
  lista: FichaDoCircuitoDTO['maioresPilotos'];
}) {
  if (lista.length === 0) {
    return null;
  }

  return (
    <section className={styles.cartao} aria-label={titulo}>
      <h2 className={styles.tituloDoCartao}>{titulo}</h2>
      <ol className={styles.ranking}>
        {lista.map((maior) => (
          <li key={maior.nome}>
            <span>{nomeDaEquipe(maior.nome)}</span>
            <span className={styles.numero}>{plural(maior.vitorias, 'vitória', 'vitórias')}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FichaDoCircuitoPage() {
  const { id = '' } = useParams();
  const ficha = useQuery(fichaDoCircuito(id));
  const anoAtual = new Date().getFullYear();

  const voltar = (
    <Link to="/circuitos" className={styles.voltar} viewTransition>
      ← Circuitos
    </Link>
  );

  if (ficha.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando o circuito…</span>
        </div>
      </>
    );
  }

  if (ficha.isError) {
    const inexistente = ficha.error instanceof ErroDaApi && [400, 404].includes(ficha.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? 'Circuito não encontrado' : 'Não foi possível carregar o circuito'}
        acao={
          <Link to="/circuitos" className={botao.secundario}>
            Ver todos os circuitos
          </Link>
        }
      >
        {inexistente
          ? 'Confira o endereço ou procure o circuito na lista.'
          : mensagemDoErro(ficha.error)}
      </Aviso>
    );
  }

  const dados = ficha.data;
  const primeiro = dados.vitorias.at(-1)?.ano;
  const ultimo = dados.vitorias[0]?.ano;
  const numeros = [
    ['GPs disputados', dados.vitorias.length],
    ['Primeiro GP', primeiro],
    ['Último GP', ultimo],
    ['Inauguração', dados.verbete?.fundacao],
  ].filter((item): item is [string, number] => typeof item[1] === 'number');

  return (
    <>
      <title>{`${dados.nome} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <p className={styles.sobretitulo}>
          {dados.noCalendarioAtual ? `No calendário de ${anoAtual}` : 'Fora do calendário atual'}
        </p>
        <h1 className={styles.titulo}>{dados.nome}</h1>
        <p className={styles.local}>
          <Bandeira pais={codigoDoPais(dados.pais)} />
          {dados.cidade}, {nomeDoPaisEmPortugues(dados.pais)}
        </p>
      </header>

      {numeros.length > 0 && (
        <dl className={styles.ficha}>
          {numeros.map(([rotulo, valor]) => (
            <div key={rotulo} className={styles.item}>
              <dt>{rotulo}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {dados.proximaCorrida && (
        <Link to="/calendario" className={styles.proxima}>
          <span className={styles.rotulo}>Próxima corrida aqui</span>
          <span className={styles.nomeDaProxima}>{nomeDoGp(dados.proximaCorrida.nome)}</span>
          <span>{dataEHora.format(new Date(dados.proximaCorrida.inicio))}, no seu horário</span>
        </Link>
      )}

      <div className={styles.colunas}>
        <div className={styles.pilha}>
          {dados.verbete && (
            <section className={styles.cartao} aria-labelledby="historia-do-circuito">
              <h2 id="historia-do-circuito" className={styles.tituloDoCartao}>
                História
              </h2>
              <p className={styles.texto}>{dados.verbete.resumo}</p>
              <p className={styles.fonte}>
                Texto da{' '}
                <a href={dados.verbete.fonte} target="_blank" rel="noopener noreferrer">
                  Wikipédia
                  <span className="apenas-leitor"> (abre em nova aba)</span>
                </a>
                , sob a licença CC BY-SA.
              </p>
            </section>
          )}

          {dados.vitorias.length > 0 && (
            <section className={styles.cartao} aria-labelledby="vencedores">
              <h2 id="vencedores" className={styles.tituloDoCartao}>
                Vencedores ano a ano
              </h2>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th scope="col">Ano</th>
                    <th scope="col">Piloto</th>
                    <th scope="col" className={styles.opcional}>
                      Equipe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dados.vitorias.map((vitoria) => (
                    <tr key={`${vitoria.ano}-${vitoria.rodada}`}>
                      <td>
                        <Link
                          to={
                            vitoria.ano === anoAtual
                              ? `/calendario/${vitoria.rodada}`
                              : `/historia/${vitoria.ano}`
                          }
                          className={styles.ano}
                          title={nomeDoGp(vitoria.gp)}
                        >
                          {vitoria.ano}
                        </Link>
                      </td>
                      <th scope="row" className={styles.piloto}>
                        {vitoria.piloto}
                        <span className={styles.equipeNoCelular}>
                          {nomeDaEquipe(vitoria.equipe)}
                        </span>
                      </th>
                      <td className={styles.opcional}>{nomeDaEquipe(vitoria.equipe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        <div className={styles.pilha}>
          <Maiores titulo="Quem mais venceu aqui" lista={dados.maioresPilotos} />
          <Maiores titulo="Equipes que mais venceram" lista={dados.maioresEquipes} />
        </div>
      </div>
    </>
  );
}
