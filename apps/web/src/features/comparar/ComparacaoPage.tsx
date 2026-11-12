import type { DesempenhoDoPilotoDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe, nomeDoGp } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { calendario } from '../calendario/api';
import { CORES_NEUTRAS } from '../calendario/cores';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { desempenhoDaTemporada } from './api';
import { confronto, type Placar, pontosAcumulados } from './comparacao';
import styles from './ComparacaoPage.module.css';
import { GraficoDePontos } from './GraficoDePontos';

const COR_A = 'var(--cor-piloto-a)';
const COR_B = 'var(--cor-piloto-b)';

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

type Piloto = DesempenhoDoPilotoDTO;

interface Metrica {
  rotulo: string;
  valor: (piloto: Piloto) => number | null;
  formatar?: (valor: number) => string;
  menorEhMelhor?: boolean;
  semVencedor?: boolean;
}

const ordinal = (valor: number) => `${decimal.format(valor)}º`;

const METRICAS: Metrica[] = [
  {
    rotulo: 'Posição no campeonato',
    valor: (p) => p.posicao,
    formatar: ordinal,
    menorEhMelhor: true,
  },
  { rotulo: 'Pontos', valor: (p) => p.pontos },
  { rotulo: 'Vitórias', valor: (p) => p.vitorias },
  { rotulo: 'Pódios', valor: (p) => p.podios },
  { rotulo: 'Largadas na pole', valor: (p) => p.poles },
  {
    rotulo: 'Melhor resultado',
    valor: (p) => p.melhorResultado,
    formatar: ordinal,
    menorEhMelhor: true,
  },
  {
    rotulo: 'Média de chegada',
    valor: (p) => p.mediaDeChegada,
    formatar: ordinal,
    menorEhMelhor: true,
  },
  { rotulo: 'Abandonos', valor: (p) => p.abandonos, menorEhMelhor: true },
  { rotulo: 'Corridas disputadas', valor: (p) => p.corridas, semVencedor: true },
];

function vencedor(metrica: Metrica, a: Piloto, b: Piloto) {
  const va = metrica.valor(a);
  const vb = metrica.valor(b);

  if (metrica.semVencedor || va === vb) {
    return null;
  }

  if (va === null || vb === null) {
    return va === null ? 'b' : 'a';
  }

  return va < vb === Boolean(metrica.menorEhMelhor) ? 'a' : 'b';
}

function Escolha({
  rotulo,
  cor,
  piloto,
  pilotos,
  outro,
  aoEscolher,
}: {
  rotulo: string;
  cor: string;
  piloto: Piloto;
  pilotos: Piloto[];
  outro: string;
  aoEscolher: (nome: string) => void;
}) {
  return (
    <div className={styles.escolha} style={{ borderTopColor: cor }}>
      <label className={styles.rotuloDaEscolha}>
        {rotulo}
        <select
          className={styles.seletor}
          value={piloto.nome}
          onChange={(evento) => aoEscolher(evento.target.value)}
        >
          {pilotos
            .filter((opcao) => opcao.nome !== outro)
            .map((opcao) => (
              <option key={opcao.nome} value={opcao.nome}>
                {opcao.posicao}º · {opcao.nome}
              </option>
            ))}
        </select>
      </label>
      <div className={styles.identidade}>
        <SimboloDaEquipe nome={piloto.equipe} {...CORES_NEUTRAS} tamanho="grande" />
        <p className={styles.nome}>{piloto.nome}</p>
        <p className={styles.equipe}>{nomeDaEquipe(piloto.equipe)}</p>
      </div>
    </div>
  );
}

function Duelo({
  titulo,
  placar,
  nomeA,
  nomeB,
}: {
  titulo: string;
  placar: Placar;
  nomeA: string;
  nomeB: string;
}) {
  const total = placar.a + placar.b;

  return (
    <div className={styles.duelo}>
      <p className={styles.tituloDoDuelo}>{titulo}</p>
      <div className={styles.placar}>
        <span className={styles.numeroDoPlacar}>{placar.a}</span>
        <span className={styles.barra} aria-hidden="true">
          {total > 0 ? (
            <>
              <span style={{ flexGrow: placar.a, background: COR_A }} />
              <span style={{ flexGrow: placar.b, background: COR_B }} />
            </>
          ) : (
            <span className={styles.barraVazia} />
          )}
        </span>
        <span className={styles.numeroDoPlacar}>{placar.b}</span>
      </div>
      <p className="apenas-leitor">
        {nomeA} {placar.a}, {nomeB} {placar.b}
      </p>
    </div>
  );
}

function Numeros({ a, b }: { a: Piloto; b: Piloto }) {
  return (
    <table className={styles.numeros}>
      <caption className="apenas-leitor">Números da temporada</caption>
      <thead className="apenas-leitor">
        <tr>
          <th scope="col">{a.nome}</th>
          <th scope="col">Estatística</th>
          <th scope="col">{b.nome}</th>
        </tr>
      </thead>
      <tbody>
        {METRICAS.map((metrica) => {
          const melhor = vencedor(metrica, a, b);
          const exibir = (piloto: Piloto) => {
            const valor = metrica.valor(piloto);

            return valor === null ? '—' : (metrica.formatar ?? decimal.format)(valor);
          };

          return (
            <tr key={metrica.rotulo}>
              <td className={melhor === 'a' ? styles.melhorA : styles.valor}>{exibir(a)}</td>
              <th scope="row" className={styles.metrica}>
                {metrica.rotulo}
              </th>
              <td className={melhor === 'b' ? styles.melhorB : styles.valor}>{exibir(b)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ComparacaoPage() {
  const [parametros, setParametros] = useSearchParams();
  const desempenho = useQuery(desempenhoDaTemporada);
  const etapas = useQuery(calendario);

  if (desempenho.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando a temporada…</span>
      </div>
    );
  }

  if (desempenho.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar a temporada"
        acao={
          <button type="button" className={botao.secundario} onClick={() => desempenho.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(desempenho.error)}
      </Aviso>
    );
  }

  const { ano, rodadasDisputadas, pilotos } = desempenho.data;

  if (pilotos.length < 2) {
    return (
      <Aviso
        titulo="Ainda não há corridas para comparar"
        acao={
          <Link to="/calendario" className={botao.secundario}>
            Ver o calendário
          </Link>
        }
      >
        A comparação aparece assim que a primeira corrida da temporada terminar.
      </Aviso>
    );
  }

  const buscarPiloto = (nome: string | null) => pilotos.find((piloto) => piloto.nome === nome);
  const a = buscarPiloto(parametros.get('a')) ?? (pilotos[0] as Piloto);
  const b =
    [buscarPiloto(parametros.get('b')), ...pilotos].find(
      (piloto): piloto is Piloto => piloto !== undefined && piloto.nome !== a.nome,
    ) ?? a;
  const { corridas, largadas } = confronto(a, b);
  const nomesDasEtapas = new Map(etapas.data?.map((etapa) => [etapa.rodada, nomeDoGp(etapa.nome)]));
  const nomeDaEtapa = (rodada: number) => nomesDasEtapas.get(rodada) ?? `Etapa ${rodada}`;
  const pontosA = pontosAcumulados(a, rodadasDisputadas);
  const pontosB = pontosAcumulados(b, rodadasDisputadas);

  function escolher(chave: 'a' | 'b', nome: string) {
    setParametros({ a: a.nome, b: b.nome, [chave]: nome }, { replace: true });
  }

  return (
    <>
      <title>{`${a.nome} x ${b.nome} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Comparar pilotos</h1>
        <p className={styles.resumo}>
          Temporada {ano}, depois de {rodadasDisputadas}{' '}
          {rodadasDisputadas === 1 ? 'etapa' : 'etapas'}.
        </p>
      </header>

      <section className={styles.escolhas} aria-label="Pilotos comparados">
        <Escolha
          rotulo="Piloto A"
          cor={COR_A}
          piloto={a}
          pilotos={pilotos}
          outro={b.nome}
          aoEscolher={(nome) => escolher('a', nome)}
        />
        <button
          type="button"
          className={styles.trocar}
          onClick={() => setParametros({ a: b.nome, b: a.nome }, { replace: true })}
        >
          <span aria-hidden="true">⇄</span>
          <span className="apenas-leitor">Trocar os lados</span>
        </button>
        <Escolha
          rotulo="Piloto B"
          cor={COR_B}
          piloto={b}
          pilotos={pilotos}
          outro={a.nome}
          aoEscolher={(nome) => escolher('b', nome)}
        />
      </section>

      <section className={styles.cartao} aria-labelledby="frente-a-frente">
        <h2 id="frente-a-frente" className={styles.tituloDoCartao}>
          Frente a frente
        </h2>
        <p className={styles.detalhe}>Quem terminou à frente nas etapas que os dois disputaram.</p>
        <Duelo titulo="Na corrida" placar={corridas} nomeA={a.nome} nomeB={b.nome} />
        <Duelo titulo="No grid de largada" placar={largadas} nomeA={a.nome} nomeB={b.nome} />
      </section>

      <section className={styles.cartao} aria-labelledby="numeros">
        <h2 id="numeros" className={styles.tituloDoCartao}>
          Números da temporada
        </h2>
        <Numeros a={a} b={b} />
      </section>

      <section className={styles.cartao} aria-labelledby="pontos">
        <h2 id="pontos" className={styles.tituloDoCartao}>
          Pontos acumulados
        </h2>
        <ul className={styles.legenda} aria-label="Legenda">
          {[
            { nome: a.nome, cor: COR_A },
            { nome: b.nome, cor: COR_B },
          ].map((item) => (
            <li key={item.nome}>
              <span className={styles.amostra} style={{ background: item.cor }} />
              {item.nome}
            </li>
          ))}
        </ul>
        <GraficoDePontos
          series={[
            { nome: a.nome, cor: COR_A, valores: pontosA },
            { nome: b.nome, cor: COR_B, valores: pontosB },
          ]}
          nomeDaEtapa={nomeDaEtapa}
        />
        <details className={styles.tabela}>
          <summary>Ver os dados em tabela</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">Etapa</th>
                <th scope="col">{a.nome}</th>
                <th scope="col">{b.nome}</th>
              </tr>
            </thead>
            <tbody>
              {pontosA.map((total, indice) => (
                <tr key={indice}>
                  <th scope="row">{nomeDaEtapa(indice + 1)}</th>
                  <td>{total}</td>
                  <td>{pontosB[indice]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
    </>
  );
}
