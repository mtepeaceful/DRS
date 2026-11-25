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
import { FotoDoCommons } from '../../shared/ui/FotoDoCommons';
import botao from '../../shared/ui/botao.module.css';
import { fichaDoCircuito } from './api';
import { NomeDoPiloto } from '../pilotos-da-historia/NomeDoPiloto';
import styles from './FichaDoCircuitoPage.module.css';
import { porIdioma, useTextos } from '../../shared/i18n/idioma';
import { COMUNS } from '../../shared/i18n/comuns';

const dataEHora = porIdioma(
  (locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }),
);

const TEXTOS = {
  pt: {
    circuitos: '← Circuitos',
    carregando: '{t.carregando}',
    naoEncontrado: 'Circuito não encontrado',
    erro: 'Não foi possível carregar o circuito',
    verTodos: 'Ver todos os circuitos',
    confira: 'Confira o endereço ou procure o circuito na lista.',
    gps: 'GPs disputados',
    primeiro: 'Primeiro GP',
    ultimo: 'Último GP',
    inauguracao: 'Inauguração',
    noCalendario: (ano: number) => `No calendário de ${ano}`,
    fora: 'Fora do calendário atual',
    proxima: 'Próxima corrida aqui',
    seuHorario: (quando: string) => `${quando}, no seu horário`,
    historia: 'História',
    foto: (nome: string) => `Foto de ${nome}`,
    textoDa: 'Texto da',
    licenca: ', sob a licença CC BY-SA.',
    vencedores: 'Vencedores ano a ano',
    ano: 'Ano',
    piloto: 'Piloto',
    equipe: 'Equipe',
    quemMais: 'Quem mais venceu aqui',
    equipesMais: 'Equipes que mais venceram',
  },
  en: {
    circuitos: '← Circuits',
    carregando: 'Loading the circuit…',
    naoEncontrado: 'Circuit not found',
    erro: 'Could not load the circuit',
    verTodos: 'See all circuits',
    confira: 'Check the address or look for the circuit in the list.',
    gps: 'GPs held',
    primeiro: 'First GP',
    ultimo: 'Last GP',
    inauguracao: 'Opened',
    noCalendario: (ano: number) => `On the ${ano} calendar`,
    fora: 'Not on the current calendar',
    proxima: 'Next race here',
    seuHorario: (quando: string) => `${quando}, your local time`,
    historia: 'History',
    foto: (nome: string) => `Photo of ${nome}`,
    textoDa: 'Text from the Portuguese',
    licenca: ', under the CC BY-SA licence.',
    vencedores: 'Winners year by year',
    ano: 'Year',
    piloto: 'Driver',
    equipe: 'Team',
    quemMais: 'Most wins here',
    equipesMais: 'Teams with most wins',
  },
};

function Maiores({
  titulo,
  lista,
  pilotos = false,
}: {
  titulo: string;
  lista: FichaDoCircuitoDTO['maioresPilotos'];
  pilotos?: boolean;
}) {
  const comuns = useTextos(COMUNS);

  if (lista.length === 0) {
    return null;
  }

  return (
    <section className={styles.cartao} aria-label={titulo}>
      <h2 className={styles.tituloDoCartao}>{titulo}</h2>
      <ol className={styles.ranking}>
        {lista.map((maior) => (
          <li key={maior.nome}>
            <span>{pilotos ? <NomeDoPiloto nome={maior.nome} /> : nomeDaEquipe(maior.nome)}</span>
            <span
              className={styles.numero}
            >{`${maior.vitorias} ${comuns.vitorias(maior.vitorias)}`}</span>
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
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  const voltar = (
    <Link to="/circuitos" className={styles.voltar} viewTransition>
      {t.circuitos}
    </Link>
  );

  if (ficha.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">{t.carregando}</span>
        </div>
      </>
    );
  }

  if (ficha.isError) {
    const inexistente = ficha.error instanceof ErroDaApi && [400, 404].includes(ficha.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? t.naoEncontrado : t.erro}
        acao={
          <Link to="/circuitos" className={botao.secundario}>
            {t.verTodos}
          </Link>
        }
      >
        {inexistente ? t.confira : mensagemDoErro(ficha.error)}
      </Aviso>
    );
  }

  const dados = ficha.data;
  const primeiro = dados.vitorias.at(-1)?.ano;
  const ultimo = dados.vitorias[0]?.ano;
  const numeros = [
    [t.gps, dados.vitorias.length],
    [t.primeiro, primeiro],
    [t.ultimo, ultimo],
    [t.inauguracao, dados.verbete?.fundacao],
  ].filter((item): item is [string, number] => typeof item[1] === 'number');

  return (
    <>
      <title>{`${dados.nome} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <p className={styles.sobretitulo}>
          {dados.noCalendarioAtual ? t.noCalendario(anoAtual) : t.fora}
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
          <span className={styles.rotulo}>{t.proxima}</span>
          <span className={styles.nomeDaProxima}>{nomeDoGp(dados.proximaCorrida.nome)}</span>
          <span>{t.seuHorario(dataEHora().format(new Date(dados.proximaCorrida.inicio)))}</span>
        </Link>
      )}

      <div className={styles.colunas}>
        <div className={styles.pilha}>
          {dados.verbete && (
            <section className={styles.cartao} aria-labelledby="historia-do-circuito">
              <h2 id="historia-do-circuito" className={styles.tituloDoCartao}>
                {t.historia}
              </h2>
              {dados.verbete.foto && (
                <FotoDoCommons foto={dados.verbete.foto} descricao={t.foto(dados.nome)} />
              )}
              <p className={styles.texto}>{dados.verbete.resumo}</p>
              <p className={styles.fonte}>
                {t.textoDa}{' '}
                <a href={dados.verbete.fonte} target="_blank" rel="noopener noreferrer">
                  Wikipédia
                  <span className="apenas-leitor">{comuns.novaAba}</span>
                </a>
                {t.licenca}
              </p>
            </section>
          )}

          {dados.vitorias.length > 0 && (
            <section className={styles.cartao} aria-labelledby="vencedores">
              <h2 id="vencedores" className={styles.tituloDoCartao}>
                {t.vencedores}
              </h2>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th scope="col">{t.ano}</th>
                    <th scope="col">{t.piloto}</th>
                    <th scope="col" className={styles.opcional}>
                      {t.equipe}
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
                        <NomeDoPiloto nome={vitoria.piloto} />
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
          <Maiores titulo={t.quemMais} lista={dados.maioresPilotos} pilotos />
          <Maiores titulo={t.equipesMais} lista={dados.maioresEquipes} />
        </div>
      </div>
    </>
  );
}
