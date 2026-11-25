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
import { BotaoDeLembrete } from './BotaoDeLembrete';
import styles from './CalendarioPage.module.css';
import { compromissosDaTemporada } from './lembrete';
import { CORES_NEUTRAS } from './cores';
import { COMUNS } from '../../shared/i18n/comuns';
import { porIdioma, useTextos } from '../../shared/i18n/idioma';

const diaDoMes = porIdioma((locale) => new Intl.DateTimeFormat(locale, { day: '2-digit' }));
const mes = porIdioma((locale) => new Intl.DateTimeFormat(locale, { month: 'short' }));
const diaDaSemana = porIdioma((locale) => new Intl.DateTimeFormat(locale, { weekday: 'short' }));

const TEXTOS = {
  pt: {
    vencedor: 'Vencedor: ',
    proxima: 'Próxima corrida',
    emBreve: 'Em breve',
    etapa: 'Etapa ',
    carregando: 'Carregando calendário…',
    erro: 'Não foi possível carregar o calendário',
    titulo: 'Calendário',
    resumo: (disputadas: number, total: number) =>
      `${disputadas} de ${total} etapas disputadas. Toque numa corrida encerrada para ver a classificação completa.`,
    mais: 'Mais do calendário',
    classificacao: 'Classificação do campeonato →',
    circuitos: 'Todos os circuitos →',
    irParaProxima: 'Ir para a próxima corrida ↓',
    lembrar: 'Lembrar das próximas corridas',
  },
  en: {
    vencedor: 'Winner: ',
    proxima: 'Next race',
    emBreve: 'Coming up',
    etapa: 'Round ',
    carregando: 'Loading the calendar…',
    erro: 'Could not load the calendar',
    titulo: 'Calendar',
    resumo: (disputadas: number, total: number) =>
      `${disputadas} of ${total} rounds completed. Tap a finished race to see the full result.`,
    mais: 'More from the calendar',
    classificacao: 'Championship standings →',
    circuitos: 'All circuits →',
    irParaProxima: 'Jump to the next race ↓',
    lembrar: 'Remind me of the next races',
  },
};

function semPonto(texto: string) {
  return texto.replace('.', '');
}

function Resultado({ etapa, proxima }: { etapa: EtapaDTO; proxima: boolean }) {
  const t = useTextos(TEXTOS);

  if (etapa.vencedor) {
    return (
      <span className={styles.vencedor}>
        <SimboloDaEquipe nome={etapa.vencedor.equipe} {...CORES_NEUTRAS} />
        <span className={styles.nomeDoVencedor}>
          <span className="apenas-leitor">{t.vencedor}</span>
          {etapa.vencedor.nome}
          <span className={styles.equipe}>{nomeDaEquipe(etapa.vencedor.equipe)}</span>
        </span>
      </span>
    );
  }

  if (proxima) {
    return <span className={styles.selo}>{t.proxima}</span>;
  }

  return <span className={styles.aguardando}>{t.emBreve}</span>;
}

function Etapa({ etapa, proxima }: { etapa: EtapaDTO; proxima: boolean }) {
  const inicio = new Date(etapa.inicio);
  const t = useTextos(TEXTOS);
  const conteudo = (
    <>
      <span className={styles.rodada}>
        <span className="apenas-leitor">{t.etapa}</span>
        {String(etapa.rodada).padStart(2, '0')}
      </span>
      <time dateTime={etapa.inicio} className={styles.data}>
        <span className={styles.dia}>
          {diaDoMes().format(inicio)} {semPonto(mes().format(inicio))}
        </span>
        <span className={styles.semana}>{semPonto(diaDaSemana().format(inicio))}</span>
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
    return (
      <li
        id={proxima ? 'proxima-corrida' : undefined}
        className={proxima ? styles.etapaProxima : styles.etapa}
      >
        {conteudo}
      </li>
    );
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
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  if (etapas.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (etapas.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => etapas.refetch()}>
            {comuns.tentarDeNovo}
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
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>
          {t.titulo} {ano}
        </h1>
        <p className={styles.resumo}>{t.resumo(disputadas, lista.length)}</p>
        <nav aria-label={t.mais} className={styles.atalhos}>
          <Link to="/classificacao">{t.classificacao}</Link>
          <Link to="/circuitos">{t.circuitos}</Link>
          {proxima && <a href="#proxima-corrida">{t.irParaProxima}</a>}
        </nav>
        <BotaoDeLembrete
          rotulo={t.lembrar}
          nomeDoArquivo={`drs-temporada-${ano}.ics`}
          compromissos={compromissosDaTemporada(lista)}
        />
      </header>

      <ol className={styles.etapas}>
        {lista.map((etapa) => (
          <Etapa key={etapa.rodada} etapa={etapa} proxima={etapa.rodada === proxima} />
        ))}
      </ol>
    </>
  );
}
