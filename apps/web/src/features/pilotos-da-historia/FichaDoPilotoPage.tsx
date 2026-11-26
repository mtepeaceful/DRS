import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { nomeDoPais } from '../../shared/lib/paises';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import { FotoDoCommons } from '../../shared/ui/FotoDoCommons';
import botao from '../../shared/ui/botao.module.css';
import { COMUNS } from '../../shared/i18n/comuns';
import { porIdioma, useIdioma, useTextos } from '../../shared/i18n/idioma';
import { fichaDoPilotoDaF1 } from './api';
import styles from './FichaDoPilotoPage.module.css';

const dataCurta = porIdioma(
  (locale) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: locale === 'pt-BR' ? 'short' : 'medium',
      timeZone: 'UTC',
    }),
);

const TEXTOS = {
  pt: {
    voltar: '← Pilotos da história',
    carregando: 'Carregando o piloto…',
    naoEncontrado: 'Piloto não encontrado',
    erro: 'Não foi possível carregar o piloto',
    buscarOutro: 'Buscar outro piloto',
    confira: 'Confira o endereço ou busque o piloto pelo nome.',
    nascimento: 'Nascimento',
    temporadas: 'Temporadas',
    corridas: 'Corridas',
    vitorias: 'Vitórias',
    podios: 'Pódios',
    poles: 'Largadas na pole',
    titulos: 'Títulos mundiais',
    pilotoDeF1: 'Piloto de Fórmula 1',
    correuEm: (ano: number) => `Correu em ${ano}`,
    correuDe: (de: number, a: number) => `Correu de ${de} a ${a}`,
    foto: (nome: string) => `Foto de ${nome}`,
    historia: 'História',
    textoDa: (idioma: string | null): string =>
      idioma === 'en' ? 'Texto da Wikipédia em inglês' : 'Texto da Wikipédia',
    licenca: ', sob a licença CC BY-SA.',
    lerMais: 'Ler mais',
    lerMenos: 'Ler menos',
    campeao: 'Campeão mundial',
    equipes: 'Equipes',
  },
  en: {
    voltar: '← Drivers in history',
    carregando: 'Loading the driver…',
    naoEncontrado: 'Driver not found',
    erro: 'Could not load the driver',
    buscarOutro: 'Search for another driver',
    confira: 'Check the address or search for the driver by name.',
    nascimento: 'Born',
    temporadas: 'Seasons',
    corridas: 'Races',
    vitorias: 'Wins',
    podios: 'Podiums',
    poles: 'Pole positions',
    titulos: 'World titles',
    pilotoDeF1: 'Formula 1 driver',
    correuEm: (ano: number) => `Raced in ${ano}`,
    correuDe: (de: number, a: number) => `Raced from ${de} to ${a}`,
    foto: (nome: string) => `Photo of ${nome}`,
    historia: 'History',
    textoDa: (idioma: string | null): string =>
      idioma === 'pt' ? 'Text from the Portuguese Wikipedia' : 'Text from Wikipedia',
    licenca: ', under the CC BY-SA licence.',
    lerMais: 'Read more',
    lerMenos: 'Show less',
    campeao: 'World champion',
    equipes: 'Teams',
  },
};

function idiomaDaFonte(fonte: string) {
  return /^(\w+)\.wikipedia\.org$/.exec(new URL(fonte).hostname)?.[1] ?? null;
}

// O resumo muda de tamanho entre os idiomas: fica recolhido em poucas linhas
// para o cartão manter a mesma altura, e o leitor abre o resto se quiser.
function TextoDaHistoria({ texto }: { texto: string }) {
  const t = useTextos(TEXTOS);
  const paragrafo = useRef<HTMLParagraphElement>(null);
  const [aberto, setAberto] = useState(false);
  const [longo, setLongo] = useState(false);

  useEffect(() => {
    const medir = () => {
      const elemento = paragrafo.current;

      if (elemento && !aberto) {
        setLongo(elemento.scrollHeight > elemento.clientHeight + 1);
      }
    };

    medir();
    window.addEventListener('resize', medir);

    return () => window.removeEventListener('resize', medir);
  }, [texto, aberto]);

  return (
    <>
      <p
        ref={paragrafo}
        id="texto-da-historia"
        className={aberto ? styles.texto : styles.textoRecolhido}
      >
        {texto}
      </p>
      {(longo || aberto) && (
        <button
          type="button"
          className={styles.lerMais}
          aria-expanded={aberto}
          aria-controls="texto-da-historia"
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? t.lerMenos : t.lerMais}
        </button>
      )}
    </>
  );
}

export function FichaDoPilotoPage() {
  const { id = '' } = useParams();
  const idioma = useIdioma();
  const cliente = useQueryClient();
  const ficha = useQuery({
    ...fichaDoPilotoDaF1(id, idioma),
    // Ao trocar de idioma, a ficha já carregada no outro idioma fica na tela enquanto a nova chega.
    placeholderData: () =>
      cliente.getQueryData(fichaDoPilotoDaF1(id, idioma === 'en' ? 'pt' : 'en').queryKey),
  });
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);

  const voltar = (
    <Link to="/historia/pilotos" className={styles.voltar} viewTransition>
      {t.voltar}
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
          <Link to="/historia/pilotos" className={botao.secundario}>
            {t.buscarOutro}
          </Link>
        }
      >
        {inexistente ? t.confira : mensagemDoErro(ficha.error)}
      </Aviso>
    );
  }

  const dados = ficha.data;
  const primeira = dados.temporadas[0];
  const ultima = dados.temporadas.at(-1);
  const numeros = [
    [t.nascimento, dados.nascimento ? dataCurta().format(new Date(dados.nascimento)) : null],
    [t.temporadas, dados.temporadas.length],
    [t.corridas, dados.corridas],
    [t.vitorias, dados.vitorias],
    [t.podios, dados.podios],
    [t.poles, dados.poles],
    [t.titulos, dados.anosDeTitulo.length],
  ].filter((item): item is [string, string | number] => item[1] !== null);

  return (
    <>
      <title>{`${dados.nome} · DRS`}</title>
      {voltar}

      <header className={dados.anosDeTitulo.length > 0 ? styles.destaqueCampeao : styles.destaque}>
        <div className={styles.identidade}>
          <p className={styles.sobretitulo}>
            {primeira === undefined
              ? t.pilotoDeF1
              : primeira === ultima || ultima === undefined
                ? t.correuEm(primeira)
                : t.correuDe(primeira, ultima)}
          </p>
          <h1 className={styles.titulo}>{dados.nome}</h1>
          {dados.pais && (
            <p className={styles.pais}>
              <Bandeira pais={dados.pais} />
              {nomeDoPais(dados.pais)}
            </p>
          )}
        </div>
        {dados.verbete?.foto && (
          <FotoDoCommons
            foto={dados.verbete.foto}
            descricao={t.foto(dados.nome)}
            className={styles.foto}
          />
        )}
      </header>

      <dl className={styles.ficha}>
        {numeros.map(([rotulo, valor]) => (
          <div key={rotulo} className={styles.item}>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.colunas}>
        {dados.verbete && (
          <section className={styles.cartao} aria-labelledby="historia-do-piloto">
            <h2 id="historia-do-piloto" className={styles.tituloDoCartao}>
              {t.historia}
            </h2>
            <TextoDaHistoria key={dados.verbete.resumo} texto={dados.verbete.resumo} />
            <p className={styles.fonte}>
              <a href={dados.verbete.fonte} target="_blank" rel="noopener noreferrer">
                {t.textoDa(idiomaDaFonte(dados.verbete.fonte))}
                <span className="apenas-leitor">{comuns.novaAba}</span>
              </a>
              {t.licenca}
            </p>
          </section>
        )}

        <div className={styles.pilha}>
          {dados.anosDeTitulo.length > 0 && (
            <section className={styles.cartao} aria-labelledby="titulos-do-piloto">
              <h2 id="titulos-do-piloto" className={styles.tituloDoCartao}>
                {t.campeao}
              </h2>
              <p className={styles.chips}>
                {dados.anosDeTitulo.map((ano) => (
                  <Link key={ano} to={`/historia/${ano}`} className={styles.ano}>
                    {ano}
                  </Link>
                ))}
              </p>
            </section>
          )}

          {dados.equipes.length > 0 && (
            <section className={styles.cartao} aria-labelledby="equipes-do-piloto">
              <h2 id="equipes-do-piloto" className={styles.tituloDoCartao}>
                {t.equipes}
              </h2>
              <p className={styles.chips}>
                {dados.equipes.map((equipe) => (
                  <Link key={equipe.id} to={`/equipes/${equipe.id}`} className={styles.equipe}>
                    {nomeDaEquipe(equipe.nome)}
                  </Link>
                ))}
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
