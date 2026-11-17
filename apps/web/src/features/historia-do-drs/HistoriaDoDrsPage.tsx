import { useId, useState } from 'react';
import { Link } from 'react-router';
import { useRolarAteAncora } from '../../shared/lib/useRolarAteAncora';
import { AsaTraseira } from '../../shared/ui/AsaTraseira';
import { TERMOS } from '../glossario/termos';
import { CAPITULOS } from './capitulos';
import styles from './HistoriaDoDrsPage.module.css';

const NOME_DO_TERMO = new Map(TERMOS.map((termo) => [termo.id, termo.nome]));
const LIMITE_EM_SEGUNDOS = 1;

const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function ZonaDeDrs() {
  const id = useId();
  const [diferenca, mudarDiferenca] = useState(1.4);
  const liberado = diferenca <= LIMITE_EM_SEGUNDOS;

  return (
    <section aria-labelledby={`${id}-titulo`} className={styles.zona}>
      <div className={styles.palco} data-liberado={liberado || undefined}>
        <AsaTraseira aberta={liberado} />
      </div>
      <div className={styles.controles}>
        <h2 id={`${id}-titulo`} className={styles.tituloDaZona}>
          Teste a regra
        </h2>
        <label htmlFor={`${id}-diferenca`} className={styles.rotulo}>
          Diferença para o carro da frente no ponto de detecção
        </label>
        <input
          id={`${id}-diferenca`}
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={diferenca}
          onChange={(evento) => mudarDiferenca(Number(evento.target.value))}
          aria-valuetext={`${decimal.format(diferenca)} segundo${diferenca === 1 ? '' : 's'}`}
          className={styles.regua}
        />
        <p className={styles.leitura}>
          <span className={styles.segundos}>{decimal.format(diferenca)} s</span>
          <span role="status" className={styles.veredito}>
            {liberado ? 'DRS liberado: a asa abre na reta.' : 'Longe demais: a asa fica fechada.'}
          </span>
        </p>
      </div>
    </section>
  );
}

export function HistoriaDoDrsPage() {
  useRolarAteAncora();

  return (
    <>
      <title>A história do DRS · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>A história do DRS</h1>
        <p className={styles.resumo}>
          Antes de ser o nome deste site, DRS era uma asa que abria. Do truque da McLaren em 2010 à
          despedida em 2026, a peça que mudou o jeito de ultrapassar na Fórmula 1.
        </p>
        <nav aria-label="Capítulos" className={styles.capitulos}>
          {CAPITULOS.map((capitulo) => (
            <a key={capitulo.id} href={`#${capitulo.id}`} className={styles.atalho}>
              {capitulo.ano}
            </a>
          ))}
        </nav>
      </header>

      <ZonaDeDrs />

      <ol className={styles.historia}>
        {CAPITULOS.map((capitulo) => (
          <li key={capitulo.id} id={capitulo.id} tabIndex={-1} className={styles.capitulo}>
            <span className={styles.ano}>{capitulo.ano}</span>
            <h2 className={styles.tituloDoCapitulo}>{capitulo.titulo}</h2>
            {capitulo.texto.map((paragrafo) => (
              <p key={paragrafo} className={styles.texto}>
                {paragrafo}
              </p>
            ))}
            {capitulo.termos.length > 0 && (
              <p className={styles.termos}>
                No glossário:{' '}
                {capitulo.termos.map((termo, indice) => (
                  <span key={termo}>
                    {indice > 0 && ', '}
                    <Link to={`/glossario#${termo}`}>{NOME_DO_TERMO.get(termo) ?? termo}</Link>
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>

      <section aria-labelledby="o-nome" className={styles.nome}>
        <h2 id="o-nome" className={styles.tituloDoCapitulo}>
          Por que este site se chama DRS
        </h2>
        <p className={styles.texto}>
          Aqui, DRS quer dizer Data Retrieval System: o site busca os dados da temporada, dos
          pilotos e da história da F1 e organiza tudo num lugar só. A asa no logo abre enquanto os
          dados carregam, como o DRS abria na reta.
        </p>
        <p className={styles.links}>
          <Link to="/carro?peca=asa-traseira">Veja a asa traseira no carro por dentro →</Link>
          <Link to="/historia/carros">A evolução dos carros →</Link>
        </p>
      </section>
    </>
  );
}
