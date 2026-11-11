import type { EtapaDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { codigoDoPais, nomeDaEquipe, nomeDoGp } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { calendario } from './api';
import styles from './CalendarioPage.module.css';
import { CORES_NEUTRAS } from './cores';

const diaDoMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const diaDaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

function semPonto(texto: string) {
  return texto.replace('.', '');
}

function Resultado({ etapa, proxima }: { etapa: EtapaDTO; proxima: boolean }) {
  if (etapa.vencedor) {
    return (
      <span className={styles.vencedor}>
        <SimboloDaEquipe nome={etapa.vencedor.equipe} {...CORES_NEUTRAS} />
        <span className={styles.nomeDoVencedor}>
          <span className="apenas-leitor">Vencedor: </span>
          {etapa.vencedor.nome}
          <span className={styles.equipe}>{nomeDaEquipe(etapa.vencedor.equipe)}</span>
        </span>
      </span>
    );
  }

  if (proxima) {
    return <span className={styles.selo}>Próxima corrida</span>;
  }

  return <span className={styles.aguardando}>Em breve</span>;
}

function Etapa({ etapa, proxima }: { etapa: EtapaDTO; proxima: boolean }) {
  const inicio = new Date(etapa.inicio);
  const conteudo = (
    <>
      <span className={styles.rodada}>
        <span className="apenas-leitor">Etapa </span>
        {String(etapa.rodada).padStart(2, '0')}
      </span>
      <time dateTime={etapa.inicio} className={styles.data}>
        <span className={styles.dia}>
          {diaDoMes.format(inicio)} {semPonto(mes.format(inicio))}
        </span>
        <span className={styles.semana}>{semPonto(diaDaSemana.format(inicio))}</span>
      </time>
      <span className={styles.gp}>
        <span className={styles.nomeDoGp}>
          <Bandeira pais={codigoDoPais(etapa.pais)} />
          {nomeDoGp(etapa.nome)}
        </span>
        <span className={styles.local}>
          {etapa.circuito} · {etapa.cidade}
        </span>
      </span>
      <Resultado etapa={etapa} proxima={proxima} />
    </>
  );

  if (!etapa.vencedor) {
    return <li className={proxima ? styles.etapaProxima : styles.etapa}>{conteudo}</li>;
  }

  return (
    <li>
      <Link to={`/calendario/${etapa.rodada}`} className={styles.link}>
        {conteudo}
        <span className={styles.seta} aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}

export function CalendarioPage() {
  const etapas = useQuery(calendario);

  if (etapas.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando calendário…</span>
      </div>
    );
  }

  if (etapas.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar o calendário"
        acao={
          <button type="button" className={botao.secundario} onClick={() => etapas.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(etapas.error)}
      </Aviso>
    );
  }

  const lista = etapas.data;
  const disputadas = lista.filter((etapa) => etapa.vencedor).length;
  const proxima = lista.find((etapa) => !etapa.vencedor)?.rodada;
  const ano = lista[0] ? new Date(lista[0].inicio).getFullYear() : '';

  return (
    <>
      <title>Calendário · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Calendário {ano}</h1>
        <p className={styles.resumo}>
          {disputadas} de {lista.length} etapas disputadas. Toque numa corrida encerrada para ver a
          classificação completa.
        </p>
      </header>

      <ol className={styles.etapas}>
        {lista.map((etapa) => (
          <Etapa key={etapa.rodada} etapa={etapa} proxima={etapa.rodada === proxima} />
        ))}
      </ol>
    </>
  );
}
