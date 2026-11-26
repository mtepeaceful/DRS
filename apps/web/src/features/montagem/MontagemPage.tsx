import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import botao from '../../shared/ui/botao.module.css';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { FotoDoCarro } from '../garagem/FotoDoCarro';
import type { Composto, Pintura, VariacaoDeAsa, VariacaoDeAssoalho } from '../garagem/cena';
import { preferePoucoMovimento, temWebgl } from '../garagem/suporte';
import { carroDaEquipe } from '../garagem/modelos';
import {
  ATRIBUTOS,
  atributos,
  CATEGORIAS,
  deParametros,
  disponibilidade,
  EQUIPES,
  type EquipeDaGaragem,
  type IdDaCategoria,
  type Montagem,
  montagemPadrao,
  montagemValida,
  orcamento,
  paraParametros,
  pecaDaMontagem,
} from './catalogo';
import { Montagem3D } from './Montagem3D';
import styles from './MontagemPage.module.css';

const CHAVE_SALVA = 'drs:montagem';

function lerSalva() {
  try {
    return deParametros(new URLSearchParams(localStorage.getItem(CHAVE_SALVA) ?? ''));
  } catch {
    return null;
  }
}

function salvar(parametros: URLSearchParams) {
  try {
    localStorage.setItem(CHAVE_SALVA, parametros.toString());
  } catch {
    // Sem armazenamento (aba anônima, por exemplo): o link continua valendo.
  }
}

// O carro 3D aparece sempre que o navegador tem WebGL. Quem prefere menos
// movimento vê o mesmo carro, só que parado; a imagem de lado fica para
// navegadores sem 3D.
function modoInicial() {
  return temWebgl() ? ('3d' as const) : ('sem-3d' as const);
}

function sinal(valor: number) {
  return valor > 0 ? `+${valor}` : String(valor);
}

function pinturaDe(equipe: EquipeDaGaragem, montagem: Montagem): Pintura {
  const patrocinio = pecaDaMontagem(montagem, 'patrocinio');

  return {
    modelo: carroDaEquipe(equipe.id),
    visual: {
      asaDianteira: pecaDaMontagem(montagem, 'asa-dianteira').visual as VariacaoDeAsa,
      asaTraseira: pecaDaMontagem(montagem, 'asa-traseira').visual as VariacaoDeAsa,
      assoalho: pecaDaMontagem(montagem, 'assoalho').visual as VariacaoDeAssoalho,
      pneus: pecaDaMontagem(montagem, 'pneus').visual as Composto,
      patrocinio: patrocinio.id === 'nenhum' ? null : patrocinio.nome,
    },
  };
}

export function MontagemPage() {
  const [parametros, setParametros] = useSearchParams();
  const [modo] = useState(modoInicial);
  const [girando, setGirando] = useState(() => !preferePoucoMovimento());
  const [copiado, setCopiado] = useState<'sim' | 'erro' | null>(null);

  const textoDosParametros = parametros.toString();
  const { equipe, montagem } = useMemo(
    () =>
      deParametros(new URLSearchParams(textoDosParametros)) ??
      lerSalva() ?? { equipe: EQUIPES[0] as EquipeDaGaragem, montagem: montagemPadrao() },
    [textoDosParametros],
  );

  const listaDeEquipes = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lista = listaDeEquipes.current;
    const marcada = lista?.querySelector<HTMLElement>(`[value="${equipe.id}"]`)?.parentElement;

    if (lista && marcada && lista.scrollWidth > lista.clientWidth) {
      lista.scrollLeft = marcada.offsetLeft - 8;
    }
  }, [equipe.id]);

  const pintura = useMemo(() => pinturaDe(equipe, montagem), [equipe, montagem]);
  const valores = atributos(equipe, montagem);
  const referencia = atributos(equipe, montagemPadrao());
  const { teto, gasto, sobra } = orcamento(montagem);

  function aplicar(novaEquipe: EquipeDaGaragem, novaMontagem: Montagem) {
    const novos = paraParametros(novaEquipe, montagemValida(novaEquipe, novaMontagem));
    setParametros(novos, { replace: true, preventScrollReset: true });
    salvar(novos);
    setCopiado(null);
  }

  async function copiarLink() {
    const endereco = new URL(window.location.href);
    endereco.search = paraParametros(equipe, montagem).toString();

    try {
      await navigator.clipboard.writeText(endereco.href);
      setCopiado('sim');
    } catch {
      setCopiado('erro');
    }
  }

  const descricao = `Carro da ${equipe.nome} montado com ${CATEGORIAS.map(({ id }) =>
    pecaDaMontagem(montagem, id).nome.toLowerCase(),
  ).join(', ')}.`;

  return (
    <>
      <title>Garagem com peças · DRS</title>

      <header className={styles.topo}>
        <p className={styles.sobretitulo}>Garagem com peças</p>
        <h1 className={styles.titulo}>Monte o carro da equipe</h1>
        <p className={styles.resumo}>
          Escolha uma equipe e troque asas, assoalho, motor, suspensão, pneus e patrocinador. Cada
          equipe só usa o que a tecnologia dela permite, e tudo cabe num teto de gastos. Peças,
          preços, níveis e patrocinadores são fictícios.
        </p>
      </header>

      <fieldset className={styles.equipes}>
        <legend className={styles.legenda}>Equipe</legend>
        <div ref={listaDeEquipes} className={styles.listaDeEquipes}>
          {EQUIPES.map((item) => (
            <label
              key={item.id}
              className={item.id === equipe.id ? styles.equipeAtiva : styles.equipe}
            >
              <input
                type="radio"
                name="equipe"
                value={item.id}
                checked={item.id === equipe.id}
                onChange={() => aplicar(item, montagem)}
                className="apenas-leitor"
              />
              <SimboloDaEquipe nome={item.nome} cor={item.cor} corSecundaria={item.corSecundaria} />
              <span>
                <span className={styles.nomeDaEquipe}>{item.nome}</span>
                <span className={styles.nivel}>
                  Nível {item.tecnologia} · {item.motor.proprio ? 'motor próprio' : 'motor cliente'}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.layout}>
        <section className={styles.vitrine} aria-label="Carro montado">
          {modo === '3d' ? (
            <Montagem3D
              pintura={pintura}
              girando={girando}
              descricao={descricao}
              aoFicarParado={() => setGirando(false)}
            />
          ) : (
            <FotoDoCarro modelo={pintura.modelo} />
          )}

          <div className={styles.controles}>
            {modo === '3d' && (
              <button
                type="button"
                className={botao.secundario}
                aria-pressed={girando}
                onClick={() => setGirando((ativo) => !ativo)}
              >
                {girando ? 'Parar de girar' : 'Girar sozinho'}
              </button>
            )}
            <button type="button" className={botao.primario} onClick={() => void copiarLink()}>
              Copiar link da montagem
            </button>
            <button
              type="button"
              className={botao.secundario}
              onClick={() => aplicar(equipe, montagemPadrao())}
            >
              Voltar ao padrão
            </button>
          </div>
          <p className={styles.dica} role="status">
            {copiado === 'sim' && 'Link copiado. Quem abrir vê este mesmo carro.'}
            {copiado === 'erro' &&
              'Não deu para copiar. O endereço desta página já é o link da montagem.'}
          </p>

          <p className={styles.motor}>
            Motor {equipe.motor.fabricante}
            {equipe.motor.proprio ? ', feito pela própria equipe.' : ', comprado de fornecedor.'}
          </p>

          <dl className={styles.atributos} aria-label="Desempenho">
            {ATRIBUTOS.map(({ id, nome }) => {
              const diferenca = valores[id] - referencia[id];

              return (
                <div key={id} className={styles.atributo}>
                  <dt>{nome}</dt>
                  <dd>
                    <span className={styles.barra} aria-hidden="true">
                      <span style={{ width: `${valores[id]}%` }} />
                    </span>
                    <span className={styles.valor}>
                      {valores[id]}
                      {diferenca !== 0 && (
                        <span className={diferenca > 0 ? styles.ganho : styles.perda}>
                          {' '}
                          {sinal(diferenca)}
                        </span>
                      )}
                    </span>
                  </dd>
                </div>
              );
            })}
            <div className={styles.atributo}>
              <dt>Teto de gastos</dt>
              <dd>
                <span className={styles.barra} aria-hidden="true">
                  <span
                    className={styles.gasto}
                    style={{ width: `${Math.min(100, (gasto / teto) * 100)}%` }}
                  />
                </span>
                <span className={styles.valor}>
                  US$ {gasto} de {teto} mi
                </span>
              </dd>
            </div>
          </dl>
          <p className={styles.dica}>
            Sobram US$ {sobra} mi. Patrocinadores aumentam o teto. Veja{' '}
            <Link to="/glossario#teto-de-gastos" className={styles.saibaMais}>
              o que é o teto de gastos
            </Link>{' '}
            e{' '}
            <Link to="/carro" className={styles.saibaMais}>
              o que cada peça faz
            </Link>
            .
          </p>
        </section>

        <div className={styles.pecas}>
          {CATEGORIAS.map((item) => (
            <Categoria
              key={item.id}
              id={item.id}
              equipe={equipe}
              montagem={montagem}
              aoEscolher={(peca) => aplicar(equipe, { ...montagem, [item.id]: peca })}
            />
          ))}
        </div>
      </div>
    </>
  );
}

interface PropsDaCategoria {
  id: IdDaCategoria;
  equipe: EquipeDaGaragem;
  montagem: Montagem;
  aoEscolher: (peca: string) => void;
}

function Categoria({ id, equipe, montagem, aoEscolher }: PropsDaCategoria) {
  const { nome, pecas } = CATEGORIAS.find((item) => item.id === id) ?? { nome: id, pecas: [] };

  return (
    <fieldset className={styles.categoria}>
      <legend className={styles.legenda}>{nome}</legend>
      {pecas.map((peca) => {
        const escolhida = montagem[id] === peca.id;
        const situacao = escolhida
          ? ({ liberada: true } as const)
          : disponibilidade(equipe, montagem, id, peca);
        const idDoMotivo = `motivo-${id}-${peca.id}`;
        const preco = peca.verba
          ? `+US$ ${peca.verba} mi no teto`
          : peca.custo > 0
            ? `US$ ${peca.custo} mi`
            : null;

        return (
          <label
            key={peca.id}
            className={
              escolhida ? styles.pecaAtiva : situacao.liberada ? styles.peca : styles.pecaTravada
            }
          >
            <input
              type="radio"
              name={id}
              value={peca.id}
              checked={escolhida}
              disabled={!situacao.liberada}
              aria-describedby={situacao.liberada ? undefined : idDoMotivo}
              onChange={() => aoEscolher(peca.id)}
            />
            <span className={styles.textoDaPeca}>
              <span className={styles.nomeDaPeca}>
                {!situacao.liberada && <span aria-hidden="true">🔒 </span>}
                {peca.nome}
                {preco && <span className={styles.preco}> · {preco}</span>}
              </span>
              <span className={styles.descricao}>{peca.descricao}</span>
              {!situacao.liberada && (
                <span id={idDoMotivo} className={styles.motivo}>
                  {situacao.motivo}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
