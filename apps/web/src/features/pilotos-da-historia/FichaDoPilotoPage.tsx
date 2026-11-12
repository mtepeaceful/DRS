import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { nomeDoPais } from '../../shared/lib/paises';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { fichaDoPilotoDaF1 } from './api';
import styles from './FichaDoPilotoPage.module.css';

const dataLonga = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });

export function FichaDoPilotoPage() {
  const { id = '' } = useParams();
  const ficha = useQuery(fichaDoPilotoDaF1(id));

  const voltar = (
    <Link to="/historia/pilotos" className={styles.voltar} viewTransition>
      ← Pilotos da história
    </Link>
  );

  if (ficha.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando o piloto…</span>
        </div>
      </>
    );
  }

  if (ficha.isError) {
    const inexistente = ficha.error instanceof ErroDaApi && [400, 404].includes(ficha.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? 'Piloto não encontrado' : 'Não foi possível carregar o piloto'}
        acao={
          <Link to="/historia/pilotos" className={botao.secundario}>
            Buscar outro piloto
          </Link>
        }
      >
        {inexistente
          ? 'Confira o endereço ou busque o piloto pelo nome.'
          : mensagemDoErro(ficha.error)}
      </Aviso>
    );
  }

  const dados = ficha.data;
  const primeira = dados.temporadas[0];
  const ultima = dados.temporadas.at(-1);
  const numeros = [
    ['Nascimento', dados.nascimento ? dataLonga.format(new Date(dados.nascimento)) : null],
    ['Temporadas', dados.temporadas.length],
    ['Corridas', dados.corridas],
    ['Vitórias', dados.vitorias],
    ['Pódios', dados.podios],
    ['Largadas na pole', dados.poles],
    ['Títulos mundiais', dados.anosDeTitulo.length],
  ].filter((item): item is [string, string | number] => item[1] !== null);

  return (
    <>
      <title>{`${dados.nome} · DRS`}</title>
      {voltar}

      <header className={dados.anosDeTitulo.length > 0 ? styles.destaqueCampeao : styles.destaque}>
        <p className={styles.sobretitulo}>
          {primeira === undefined
            ? 'Piloto de Fórmula 1'
            : primeira === ultima
              ? `Correu em ${primeira}`
              : `Correu de ${primeira} a ${ultima}`}
        </p>
        <h1 className={styles.titulo}>{dados.nome}</h1>
        {dados.pais && (
          <p className={styles.pais}>
            <Bandeira pais={dados.pais} />
            {nomeDoPais(dados.pais)}
          </p>
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
              História
            </h2>
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

        <div className={styles.pilha}>
          {dados.anosDeTitulo.length > 0 && (
            <section className={styles.cartao} aria-labelledby="titulos-do-piloto">
              <h2 id="titulos-do-piloto" className={styles.tituloDoCartao}>
                Campeão mundial
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
                Equipes
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
