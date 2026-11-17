import type { HistoriaDosCampeoesDTO } from '@drs/contracts';
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { corDoTitulo, equipeDoTitulo } from './coresDasEquipes';
import styles from './LinhaDoTempo.module.css';

type Temporada = HistoriaDosCampeoesDTO['temporadas'][number];

function anosEntre(primeiro: number, ultimo: number) {
  return Array.from({ length: ultimo - primeiro + 1 }, (_, indice) => primeiro + indice);
}

function equipesPorTitulos(temporadas: Temporada[]) {
  const titulos = new Map<string, { equipe: string; titulos: number; cor: string }>();

  for (const temporada of temporadas) {
    const equipe = nomeDaEquipe(equipeDoTitulo(temporada.equipe));
    const atual = titulos.get(equipe) ?? { equipe, titulos: 0, cor: corDoTitulo(temporada.equipe) };
    titulos.set(equipe, { ...atual, titulos: atual.titulos + 1 });
  }

  return [...titulos.values()].sort(
    (a, b) => b.titulos - a.titulos || a.equipe.localeCompare(b.equipe),
  );
}

function cor(equipe: string) {
  return { '--cor-titulo': corDoTitulo(equipe) } as CSSProperties;
}

export function LinhaDoTempo({ temporadas }: { temporadas: Temporada[] }) {
  const porAno = new Map(temporadas.map((temporada) => [temporada.ano, temporada]));
  const anos = temporadas.map((temporada) => temporada.ano);
  const primeiro = Math.min(...anos);
  const ultimo = Math.max(...anos);
  const [anoEmDestaque, destacar] = useState(ultimo);
  const destaque = porAno.get(anoEmDestaque);

  return (
    <section aria-labelledby="linha-do-tempo" className={styles.linhaDoTempo}>
      <h2 id="linha-do-tempo" className={styles.titulo}>
        Linha do tempo
      </h2>
      <p className={styles.resumo}>
        Cada faixa é um título de pilotos, de {primeiro} a {ultimo}, na cor da equipe do campeão.
      </p>

      <div className={styles.trilho}>
        <ol className={styles.faixas}>
          {anosEntre(primeiro, ultimo).map((ano) => {
            const temporada = porAno.get(ano);
            const marca = ano % 10 === 0 && (
              <span className={styles.marca} aria-hidden="true">
                {ano}
              </span>
            );

            if (!temporada) {
              return (
                <li key={ano} className={styles.ano}>
                  <span className={`${styles.faixa} ${styles.vazia}`} title={`${ano}: buscando`} />
                  {marca}
                </li>
              );
            }

            return (
              <li key={ano} className={styles.ano}>
                <Link
                  to={`/historia/${ano}`}
                  className={styles.faixa}
                  style={cor(temporada.equipe)}
                  aria-label={`${ano}: ${temporada.piloto}, ${nomeDaEquipe(temporada.equipe)}`}
                  data-destaque={ano === anoEmDestaque || undefined}
                  onMouseEnter={() => destacar(ano)}
                  onFocus={() => destacar(ano)}
                />
                {marca}
              </li>
            );
          })}
        </ol>
      </div>

      {destaque && (
        <p className={styles.destaque} aria-hidden="true">
          <span className={styles.anoEmDestaque}>{destaque.ano}</span>
          <span className={styles.amostra} style={cor(destaque.equipe)} />
          {destaque.piloto} · {nomeDaEquipe(destaque.equipe)}
        </p>
      )}

      <ul className={styles.legenda} aria-label="Títulos por equipe">
        {equipesPorTitulos(temporadas).map(({ equipe, titulos, cor: corDaEquipe }) => (
          <li key={equipe} className={styles.equipe}>
            <span
              className={styles.amostra}
              style={{ '--cor-titulo': corDaEquipe } as CSSProperties}
            />
            {equipe}
            <span className={styles.titulos}>
              {titulos}
              <span className="apenas-leitor">{titulos === 1 ? ' título' : ' títulos'}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
