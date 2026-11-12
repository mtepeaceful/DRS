import type { FichaDaEquipeDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { nomeDoPais } from '../../shared/lib/paises';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import { FotoDoCommons } from '../../shared/ui/FotoDoCommons';
import botao from '../../shared/ui/botao.module.css';
import { CORES_NEUTRAS } from '../calendario/cores';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { fichaDaEquipe } from './api';
import { NomeDoPiloto } from '../pilotos-da-historia/NomeDoPiloto';
import styles from './FichaDaEquipePage.module.css';

function periodo({ temporadas, noGridAtual }: FichaDaEquipeDTO) {
  const primeira = temporadas[0];
  const ultima = temporadas.at(-1);

  if (primeira === undefined || ultima === undefined) {
    return null;
  }

  if (noGridAtual) {
    return `Na F1 desde ${primeira}`;
  }

  return primeira === ultima ? `Correu em ${primeira}` : `Correu de ${primeira} a ${ultima}`;
}

function Ficha({ ficha }: { ficha: FichaDaEquipeDTO }) {
  const { verbete } = ficha;
  const itens = [
    ['Fundação', verbete?.fundacao],
    ['Fundação por', verbete?.fundadores.length ? verbete.fundadores.join(', ') : null],
    ['Sede', verbete?.sede],
    ['País', ficha.pais ? nomeDoPais(ficha.pais) : null],
    ['Estreia na F1', ficha.temporadas[0]],
    ['Temporadas', ficha.temporadas.length],
    ['Corridas', ficha.corridas],
    ['Vitórias', ficha.vitorias],
    ['Pódios', ficha.podios],
    ['Largadas na pole', ficha.poles],
  ].filter((item): item is [string, string | number] => item[1] !== null && item[1] !== undefined);

  return (
    <dl className={styles.ficha}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className={styles.item}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Titulos({ ficha }: { ficha: FichaDaEquipeDTO }) {
  if (ficha.anosDeTitulo.length === 0 && ficha.campeoesDePilotos.length === 0) {
    return null;
  }

  return (
    <section className={styles.cartao} aria-labelledby="titulos">
      <h2 id="titulos" className={styles.tituloDoCartao}>
        Títulos
      </h2>
      {ficha.anosDeTitulo.length > 0 && (
        <div className={styles.grupo}>
          <p className={styles.rotulo}>
            {ficha.anosDeTitulo.length} {ficha.anosDeTitulo.length === 1 ? 'título' : 'títulos'} de
            construtores
          </p>
          <p className={styles.anos}>
            {ficha.anosDeTitulo.map((ano) => (
              <Link key={ano} to={`/historia/${ano}`} className={styles.ano}>
                {ano}
              </Link>
            ))}
          </p>
        </div>
      )}
      {ficha.campeoesDePilotos.length > 0 && (
        <div className={styles.grupo}>
          <p className={styles.rotulo}>
            {ficha.campeoesDePilotos.length}{' '}
            {ficha.campeoesDePilotos.length === 1 ? 'título' : 'títulos'} de pilotos
          </p>
          <ul className={styles.campeoes}>
            {ficha.campeoesDePilotos.map(({ ano, piloto }) => (
              <li key={ano}>
                <Link to={`/historia/${ano}`} className={styles.ano}>
                  {ano}
                </Link>
                <NomeDoPiloto nome={piloto} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function FichaDaEquipePage() {
  const { id = '' } = useParams();
  const ficha = useQuery(fichaDaEquipe(id));

  const voltar = (
    <Link to="/equipes" className={styles.voltar} viewTransition>
      ← Equipes
    </Link>
  );

  if (ficha.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando a equipe…</span>
        </div>
      </>
    );
  }

  if (ficha.isError) {
    const inexistente = ficha.error instanceof ErroDaApi && [400, 404].includes(ficha.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? 'Equipe não encontrada' : 'Não foi possível carregar a equipe'}
        acao={
          <Link to="/equipes" className={botao.secundario}>
            Ver todas as equipes
          </Link>
        }
      >
        {inexistente
          ? 'Confira o endereço ou procure a equipe na lista.'
          : mensagemDoErro(ficha.error)}
      </Aviso>
    );
  }

  const dados = ficha.data;
  const nome = nomeDaEquipe(dados.nome);

  return (
    <>
      <title>{`${nome} · DRS`}</title>
      {voltar}

      <header className={styles.destaque}>
        <span className={styles.logo}>
          <SimboloDaEquipe nome={dados.nome} {...CORES_NEUTRAS} tamanho="grande" />
        </span>
        <div className={styles.cabecalho}>
          <p className={styles.sobretitulo}>{periodo(dados)}</p>
          <h1 className={styles.titulo}>{nome}</h1>
          {dados.pais && (
            <p className={styles.pais}>
              <Bandeira pais={dados.pais} />
              {nomeDoPais(dados.pais)}
            </p>
          )}
        </div>
      </header>

      <Ficha ficha={dados} />

      <div className={dados.temporadaAtual ? styles.colunas : styles.umaColuna}>
        <div className={styles.pilha}>
          {dados.verbete && (
            <section className={styles.cartao} aria-labelledby="historia-da-equipe">
              <h2 id="historia-da-equipe" className={styles.tituloDoCartao}>
                História
              </h2>
              {dados.verbete.foto && (
                <FotoDoCommons foto={dados.verbete.foto} descricao={`Foto ligada a ${nome}`} />
              )}
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
          <Titulos ficha={dados} />
        </div>

        {dados.temporadaAtual && (
          <section className={styles.cartao} aria-labelledby="temporada-atual">
            <h2 id="temporada-atual" className={styles.tituloDoCartao}>
              Temporada {new Date().getFullYear()}
            </h2>
            <p className={styles.detalhe}>
              {dados.temporadaAtual.posicao}º entre os construtores · {dados.temporadaAtual.pontos}{' '}
              pts
            </p>
            <ul className={styles.pilotos}>
              {dados.temporadaAtual.pilotos.map((piloto) => (
                <li key={piloto.nome}>
                  <Link to={`/pilotos?busca=${encodeURIComponent(piloto.nome)}`}>
                    {piloto.nome}
                  </Link>
                  <span className={styles.pontos}>{piloto.pontos} pts</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
