import type { PainelDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { CORES_NEUTRAS } from '../calendario/cores';
import { Podio } from '../calendario/Podio';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { painel } from './api';
import { ContagemRegressiva } from './ContagemRegressiva';
import styles from './HomePage.module.css';
import { ondeAssistir, TEMPORADA_DO_GUIA } from './onde-assistir';
import { nomeDaEquipe, nomeDoGp, nomeDoPaisEmPortugues } from '../../shared/lib/traducoes';

type Campeonato = NonNullable<PainelDTO['campeonato']>;
type Corrida = NonNullable<Campeonato['proximaCorrida']>;

const diaDaSessao = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});
const horaDaSessao = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dataLonga = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
const tempoRelativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

function haQuantoTempo(data: string) {
  const minutos = Math.round((Date.parse(data) - Date.now()) / 60_000);

  if (minutos > -60) return tempoRelativo.format(Math.min(minutos, -1), 'minute');
  if (minutos > -60 * 24) return tempoRelativo.format(Math.round(minutos / 60), 'hour');

  return tempoRelativo.format(Math.round(minutos / (60 * 24)), 'day');
}

function ProximaCorrida({ corrida, total }: { corrida: Corrida; total: number }) {
  return (
    <section className={styles.destaque} aria-labelledby="proxima-corrida">
      <div className={styles.destaqueTexto}>
        <p className={styles.sobretitulo}>
          Próxima corrida · Etapa {corrida.rodada} de {total}
        </p>
        <h1 id="proxima-corrida" className={styles.nomeDoGp}>
          {nomeDoGp(corrida.nome)}
        </h1>
        <p className={styles.local}>
          {corrida.circuito} · {corrida.cidade}, {nomeDoPaisEmPortugues(corrida.pais)}
        </p>
        <ContagemRegressiva ate={corrida.inicio} />
        <Link to="/calendario" className={styles.linkDoCartao}>
          Ver o calendário completo →
        </Link>
      </div>

      <div className={styles.agenda}>
        <h2 className={styles.tituloDaAgenda}>Programação no seu horário</h2>
        <ol className={styles.sessoes}>
          {corrida.sessoes.map((sessao) => (
            <li
              key={sessao.nome}
              className={sessao.nome === 'Corrida' ? styles.sessaoPrincipal : styles.sessao}
            >
              <span className={styles.nomeDaSessao}>{sessao.nome}</span>
              <time dateTime={sessao.inicio} className={styles.horario}>
                <span>{diaDaSessao.format(new Date(sessao.inicio))}</span>
                <span className={styles.hora}>{horaDaSessao.format(new Date(sessao.inicio))}</span>
              </time>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Classificacao({ campeonato }: { campeonato: Campeonato }) {
  const lider = campeonato.pilotos[0]?.pontos || 1;

  return (
    <section className={styles.cartao} aria-labelledby="classificacao-pilotos">
      <header className={styles.cabecalhoDoCartao}>
        <h2 id="classificacao-pilotos" className={styles.tituloDoCartao}>
          Campeonato de pilotos
        </h2>
        <p className={styles.detalhe}>
          Após {campeonato.rodadasDisputadas} de {campeonato.totalDeRodadas} etapas
        </p>
      </header>
      <ol className={styles.tabela}>
        {campeonato.pilotos.slice(0, 10).map((piloto) => (
          <li key={piloto.nome} className={styles.linha}>
            <span className={styles.posicao}>{piloto.posicao}</span>
            <SimboloDaEquipe nome={piloto.equipe} {...CORES_NEUTRAS} />
            <span className={styles.nome}>
              {piloto.nome}
              <span className={styles.barra} aria-hidden="true">
                <span style={{ width: `${(piloto.pontos / lider) * 100}%` }} />
              </span>
            </span>
            <span className={styles.pontos}>
              {piloto.pontos}
              <span className="apenas-leitor"> pontos</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Construtores({ campeonato }: { campeonato: Campeonato }) {
  return (
    <section className={styles.cartao} aria-labelledby="classificacao-construtores">
      <header className={styles.cabecalhoDoCartao}>
        <h2 id="classificacao-construtores" className={styles.tituloDoCartao}>
          Construtores
        </h2>
      </header>
      <ol className={styles.tabela}>
        {campeonato.construtores.slice(0, 5).map((equipe) => (
          <li key={equipe.nome} className={styles.linha}>
            <span className={styles.posicao}>{equipe.posicao}</span>
            <SimboloDaEquipe nome={equipe.nome} {...CORES_NEUTRAS} />
            <span className={styles.nome}>{nomeDaEquipe(equipe.nome)}</span>
            <span className={styles.pontos}>
              {equipe.pontos}
              <span className="apenas-leitor"> pontos</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function UltimaCorrida({ corrida }: { corrida: NonNullable<Campeonato['ultimaCorrida']> }) {
  return (
    <section className={styles.cartao} aria-labelledby="ultima-corrida">
      <header className={styles.cabecalhoDoCartao}>
        <h2 id="ultima-corrida" className={styles.tituloDoCartao}>
          Último pódio
        </h2>
        <p className={styles.detalhe}>
          {nomeDoGp(corrida.nome)} · {dataLonga.format(new Date(corrida.data))}
        </p>
      </header>
      <div className={styles.rodapeDoCartao}>
        <Podio pilotos={corrida.podio} />
        <Link to={`/calendario/${corrida.rodada}`} className={styles.linkDoCartao}>
          Resultado completo →
        </Link>
      </div>
    </section>
  );
}

function OndeAssistir() {
  return (
    <section aria-labelledby="onde-assistir" className={styles.secao}>
      <header className={styles.cabecalhoDaSecao}>
        <h2 id="onde-assistir" className={styles.tituloDaSecao}>
          Onde assistir no Brasil
        </h2>
        <p className={styles.detalhe}>
          Temporada {TEMPORADA_DO_GUIA}. Algumas etapas ficam fora da TV aberta, então confira a
          programação da semana.
        </p>
      </header>
      <ul className={styles.canais}>
        {ondeAssistir.map((opcao) => (
          <li key={opcao.nome} className={styles.canal}>
            <span className={styles.tipo}>{opcao.tipo}</span>
            <a
              href={opcao.site}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.nomeDoCanal}
            >
              {opcao.nome}
              <span className="apenas-leitor"> (abre em nova aba)</span>
            </a>
            <p className={styles.descricao}>{opcao.descricao}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Noticias({ noticias }: { noticias: PainelDTO['noticias'] }) {
  return (
    <section aria-labelledby="noticias" className={styles.secao}>
      <header className={styles.cabecalhoDaSecao}>
        <h2 id="noticias" className={styles.tituloDaSecao}>
          Últimas notícias
        </h2>
      </header>
      {noticias.length === 0 ? (
        <p className={styles.detalhe}>As notícias estão indisponíveis no momento.</p>
      ) : (
        <ul className={styles.noticias}>
          {noticias.map((noticia) => (
            <li key={noticia.link}>
              <a
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.noticia}
              >
                <span className={styles.tituloDaNoticia}>{noticia.titulo}</span>
                <span className={styles.fonteDaNoticia}>
                  {noticia.fonte} ·{' '}
                  <time dateTime={noticia.publicadaEm}>{haQuantoTempo(noticia.publicadaEm)}</time>
                  <span className="apenas-leitor"> (abre em nova aba)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HomePage() {
  const dados = useQuery(painel);

  if (dados.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando…</span>
      </div>
    );
  }

  if (dados.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar a página inicial"
        acao={
          <button type="button" className={botao.secundario} onClick={() => dados.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(dados.error)}
      </Aviso>
    );
  }

  const { campeonato, noticias } = dados.data;

  return (
    <>
      <title>DRS · Fórmula 1</title>

      {campeonato?.proximaCorrida ? (
        <ProximaCorrida corrida={campeonato.proximaCorrida} total={campeonato.totalDeRodadas} />
      ) : (
        <section className={styles.destaque}>
          <div className={styles.destaqueTexto}>
            <p className={styles.sobretitulo}>Temporada {campeonato?.ano}</p>
            <h1 className={styles.nomeDoGp}>{campeonato ? 'Temporada encerrada' : 'Fórmula 1'}</h1>
            <Link to="/pilotos" className={botao.primario}>
              Ver o grid de pilotos
            </Link>
          </div>
        </section>
      )}

      {campeonato && (
        <div className={styles.colunas}>
          <Classificacao campeonato={campeonato} />
          <div className={styles.pilha}>
            <Construtores campeonato={campeonato} />
            {campeonato.ultimaCorrida && <UltimaCorrida corrida={campeonato.ultimaCorrida} />}
          </div>
        </div>
      )}

      <OndeAssistir />
      <Noticias noticias={noticias} />
    </>
  );
}
