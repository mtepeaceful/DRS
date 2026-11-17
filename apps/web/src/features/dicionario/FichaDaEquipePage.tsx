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
import { COMUNS } from '../../shared/i18n/comuns';
import { useTextos } from '../../shared/i18n/idioma';
import { fichaDaEquipe } from './api';
import { NomeDoPiloto } from '../pilotos-da-historia/NomeDoPiloto';
import styles from './FichaDaEquipePage.module.css';

const TEXTOS = {
  pt: {
    desde: (ano: number) => `Na F1 desde ${ano}`,
    correuEm: (ano: number) => `Correu em ${ano}`,
    correuDe: (de: number, a: number) => `Correu de ${de} a ${a}`,
    fundacao: 'Fundação',
    fundadores: 'Fundação por',
    sede: 'Sede',
    pais: 'País',
    estreia: 'Estreia na F1',
    temporadas: 'Temporadas',
    corridas: 'Corridas',
    vitorias: 'Vitórias',
    podios: 'Pódios',
    poles: 'Largadas na pole',
    titulos: 'Títulos',
    deConstrutores: (n: number) => `${n} ${n === 1 ? 'título' : 'títulos'} de construtores`,
    dePilotos: (n: number) => `${n} ${n === 1 ? 'título' : 'títulos'} de pilotos`,
    equipes: '← Equipes',
    carregando: '{t.carregando}',
    naoEncontrada: 'Equipe não encontrada',
    erro: 'Não foi possível carregar a equipe',
    verTodas: 'Ver todas as equipes',
    confira: 'Confira o endereço ou procure a equipe na lista.',
    historia: 'História',
    foto: (nome: string) => `Foto ligada a ${nome}`,
    textoDa: 'Texto da',
    licenca: ', sob a licença CC BY-SA.',
    temporada: (ano: number) => `Temporada ${ano}`,
    posicao: (posicao: number, pontos: number) =>
      `${posicao}º entre os construtores · ${pontos} pts`,
  },
  en: {
    desde: (ano: number) => `In F1 since ${ano}`,
    correuEm: (ano: number) => `Raced in ${ano}`,
    correuDe: (de: number, a: number) => `Raced from ${de} to ${a}`,
    fundacao: 'Founded',
    fundadores: 'Founded by',
    sede: 'Base',
    pais: 'Country',
    estreia: 'F1 debut',
    temporadas: 'Seasons',
    corridas: 'Races',
    vitorias: 'Wins',
    podios: 'Podiums',
    poles: 'Pole positions',
    titulos: 'Titles',
    deConstrutores: (n: number) => `${n} constructors’ ${n === 1 ? 'title' : 'titles'}`,
    dePilotos: (n: number) => `${n} drivers’ ${n === 1 ? 'title' : 'titles'}`,
    equipes: '← Teams',
    carregando: 'Loading the team…',
    naoEncontrada: 'Team not found',
    erro: 'Could not load the team',
    verTodas: 'See all teams',
    confira: 'Check the address or look for the team in the list.',
    historia: 'History',
    foto: (nome: string) => `Photo related to ${nome}`,
    textoDa: 'Text from the Portuguese',
    licenca: ', under the CC BY-SA licence.',
    temporada: (ano: number) => `${ano} season`,
    posicao: (posicao: number, pontos: number) => `P${posicao} among constructors · ${pontos} pts`,
  },
};

type Textos = (typeof TEXTOS)['pt'];

function periodo({ temporadas, noGridAtual }: FichaDaEquipeDTO, t: Textos) {
  const primeira = temporadas[0];
  const ultima = temporadas.at(-1);

  if (primeira === undefined || ultima === undefined) {
    return null;
  }

  if (noGridAtual) {
    return t.desde(primeira);
  }

  return primeira === ultima ? t.correuEm(primeira) : t.correuDe(primeira, ultima);
}

function Ficha({ ficha }: { ficha: FichaDaEquipeDTO }) {
  const { verbete } = ficha;
  const t = useTextos(TEXTOS);
  const itens = [
    [t.fundacao, verbete?.fundacao],
    [t.fundadores, verbete?.fundadores.length ? verbete.fundadores.join(', ') : null],
    [t.sede, verbete?.sede],
    [t.pais, ficha.pais ? nomeDoPais(ficha.pais) : null],
    [t.estreia, ficha.temporadas[0]],
    [t.temporadas, ficha.temporadas.length],
    [t.corridas, ficha.corridas],
    [t.vitorias, ficha.vitorias],
    [t.podios, ficha.podios],
    [t.poles, ficha.poles],
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
  const t = useTextos(TEXTOS);

  if (ficha.anosDeTitulo.length === 0 && ficha.campeoesDePilotos.length === 0) {
    return null;
  }

  return (
    <section className={styles.cartao} aria-labelledby="titulos">
      <h2 id="titulos" className={styles.tituloDoCartao}>
        {t.titulos}
      </h2>
      {ficha.anosDeTitulo.length > 0 && (
        <div className={styles.grupo}>
          <p className={styles.rotulo}>{t.deConstrutores(ficha.anosDeTitulo.length)}</p>
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
          <p className={styles.rotulo}>{t.dePilotos(ficha.campeoesDePilotos.length)}</p>
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
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  const voltar = (
    <Link to="/equipes" className={styles.voltar} viewTransition>
      {t.equipes}
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
        titulo={inexistente ? t.naoEncontrada : t.erro}
        acao={
          <Link to="/equipes" className={botao.secundario}>
            {t.verTodas}
          </Link>
        }
      >
        {inexistente ? t.confira : mensagemDoErro(ficha.error)}
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
          <p className={styles.sobretitulo}>{periodo(dados, t)}</p>
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
                {t.historia}
              </h2>
              {dados.verbete.foto && (
                <FotoDoCommons foto={dados.verbete.foto} descricao={t.foto(nome)} />
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
          <Titulos ficha={dados} />
        </div>

        {dados.temporadaAtual && (
          <section className={styles.cartao} aria-labelledby="temporada-atual">
            <h2 id="temporada-atual" className={styles.tituloDoCartao}>
              {t.temporada(new Date().getFullYear())}
            </h2>
            <p className={styles.detalhe}>
              {t.posicao(dados.temporadaAtual.posicao, dados.temporadaAtual.pontos)}
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
