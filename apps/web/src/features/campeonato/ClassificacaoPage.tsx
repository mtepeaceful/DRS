import type { PainelDTO } from '@drs/contracts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { CORES_NEUTRAS } from '../calendario/cores';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { painel } from '../home/api';
import { COMUNS } from '../../shared/i18n/comuns';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './ClassificacaoPage.module.css';

const TEXTOS = {
  pt: {
    vitorias: 'Vitórias',
    vit: 'Vit',
    carregando: 'Carregando a classificação…',
    erro: 'Não foi possível carregar a classificação',
    foraDoAr: 'A fonte dos dados do campeonato está fora do ar agora.',
    titulo: 'Classificação',
    depois: (feitas: number, total: number) => `Depois de ${feitas} de ${total} etapas.`,
    calendario: 'Ver o calendário →',
    pilotos: 'Pilotos',
    piloto: 'Piloto',
    construtores: 'Construtores',
    equipe: 'Equipe',
  },
  en: {
    vitorias: 'Wins',
    vit: 'W',
    carregando: 'Loading the standings…',
    erro: 'Could not load the standings',
    foraDoAr: 'The championship data source is down right now.',
    titulo: 'Standings',
    depois: (feitas: number, total: number) => `After ${feitas} of ${total} rounds.`,
    calendario: 'See the calendar →',
    pilotos: 'Drivers',
    piloto: 'Driver',
    construtores: 'Constructors',
    equipe: 'Team',
  },
};

type Campeonato = NonNullable<PainelDTO['campeonato']>;

interface Linha {
  posicao: number;
  nome: string;
  equipe: string;
  detalhe?: string;
  vitorias: number;
  pontos: number;
}

function Tabela({ titulo, linhas, rotulo }: { titulo: string; linhas: Linha[]; rotulo: string }) {
  const lider = linhas[0]?.pontos || 1;
  const id = `tabela-${rotulo}`;
  const t = useTextos(TEXTOS);

  return (
    <section className={styles.cartao} aria-labelledby={id}>
      <h2 id={id} className={styles.tituloDoCartao}>
        {titulo}
      </h2>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th scope="col" className={styles.posicao}>
              Pos
            </th>
            <th scope="col">{rotulo}</th>
            <th scope="col" className={styles.numero}>
              <abbr title={t.vitorias}>{t.vit}</abbr>
            </th>
            <th scope="col" className={styles.numero}>
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.nome}>
              <td className={styles.posicao}>{linha.posicao}</td>
              <th scope="row" className={styles.nome}>
                <span className={styles.identidade}>
                  <SimboloDaEquipe nome={linha.equipe} {...CORES_NEUTRAS} />
                  <span className={styles.textos}>
                    {linha.nome}
                    {linha.detalhe && <span className={styles.detalhe}>{linha.detalhe}</span>}
                    <span className={styles.barra} aria-hidden="true">
                      <span style={{ width: `${(linha.pontos / lider) * 100}%` }} />
                    </span>
                  </span>
                </span>
              </th>
              <td className={styles.numero}>{linha.vitorias}</td>
              <td className={styles.pontos}>{linha.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function linhasDePilotos({ pilotos }: Campeonato): Linha[] {
  return pilotos.map((piloto) => ({ ...piloto, detalhe: nomeDaEquipe(piloto.equipe) }));
}

function linhasDeConstrutores({ construtores }: Campeonato): Linha[] {
  return construtores.map((equipe) => ({
    ...equipe,
    nome: nomeDaEquipe(equipe.nome),
    equipe: equipe.nome,
  }));
}

export function ClassificacaoPage() {
  const dados = useQuery(painel);
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  if (dados.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (dados.isError || !dados.data.campeonato) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => dados.refetch()}>
            {comuns.tentarDeNovo}
          </button>
        }
      >
        {dados.isError ? mensagemDoErro(dados.error) : t.foraDoAr}
      </Aviso>
    );
  }

  const campeonato = dados.data.campeonato;

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>
      <header className={styles.topo}>
        <h1 className={styles.titulo}>
          {t.titulo} {campeonato.ano}
        </h1>
        <p className={styles.resumo}>
          {t.depois(campeonato.rodadasDisputadas, campeonato.totalDeRodadas)}{' '}
          <Link to="/calendario">{t.calendario}</Link>
        </p>
      </header>
      <div className={styles.colunas}>
        <Tabela titulo={t.pilotos} rotulo={t.piloto} linhas={linhasDePilotos(campeonato)} />
        <Tabela
          titulo={t.construtores}
          rotulo={t.equipe}
          linhas={linhasDeConstrutores(campeonato)}
        />
      </div>
    </>
  );
}
