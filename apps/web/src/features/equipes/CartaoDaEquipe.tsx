import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { type CoresDaEquipe, estiloDaEquipe } from '../../shared/lib/equipe';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './CartaoDaEquipe.module.css';
import { SilhuetaDoCarro } from './SilhuetaDoCarro';
import { SimboloDaEquipe } from './SimboloDaEquipe';
import { useAcenderNaTela } from './useAcender';

export interface PilotoDoCartao {
  nome: string;
  numero: number;
}

export interface EquipeDoCartao {
  /** A ficha da equipe no dicionário. Sem ela, o cartão não leva a lugar nenhum. */
  id: string | null;
  nome: string;
  cores: CoresDaEquipe;
  pilotos: PilotoDoCartao[];
}

const TEXTOS = {
  pt: { verEquipe: 'Ver a equipe', numero: (n: number) => `Número ${n}` },
  en: { verEquipe: 'See the team', numero: (n: number) => `Number ${n}` },
};

function separarNome(nome: string) {
  const partes = nome.trim().split(/\s+/);

  return partes.length > 1
    ? { primeiro: partes.slice(0, -1).join(' '), ultimo: partes.at(-1) ?? '' }
    : { primeiro: '', ultimo: nome };
}

export function CartaoDaEquipe({ equipe }: { equipe: EquipeDoCartao }) {
  const t = useTextos(TEXTOS);
  const ref = useRef<HTMLElement>(null);
  const [apontado, setApontado] = useState(false);
  const naTela = useAcenderNaTela(ref);
  const acesa = apontado || naTela;
  const nome = nomeDaEquipe(equipe.nome);

  const conteudo = (
    <>
      <div className={styles.topo}>
        <h3 className={styles.nome}>{nome}</h3>
        <div className={styles.logo}>
          <SimboloDaEquipe nome={equipe.nome} {...equipe.cores} />
        </div>
      </div>

      {equipe.pilotos.length > 0 && (
        <ul className={styles.pilotos}>
          {equipe.pilotos.map((piloto) => {
            const { primeiro, ultimo } = separarNome(piloto.nome);

            return (
              <li key={`${piloto.numero}-${piloto.nome}`} className={styles.piloto}>
                <span className={styles.numero}>
                  <span aria-hidden="true">{piloto.numero}</span>
                  <span className="apenas-leitor">{t.numero(piloto.numero)}</span>
                </span>
                <span className={styles.nomeDoPiloto}>
                  {primeiro && <span className={styles.primeiroNome}>{primeiro}</span>}
                  <span className={styles.sobrenome}>{ultimo}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.carro}>
        <SilhuetaDoCarro
          nome={equipe.nome}
          numero={equipe.pilotos[0]?.numero}
          {...equipe.cores}
          acesa={acesa}
        />
      </div>

      {equipe.id && (
        <span className={styles.ver} aria-hidden="true">
          {t.verEquipe} →
        </span>
      )}
    </>
  );

  return (
    <article
      ref={ref}
      className={styles.cartao}
      style={estiloDaEquipe(equipe.cores)}
      data-acesa={acesa || undefined}
      onPointerEnter={() => setApontado(true)}
      onPointerLeave={() => setApontado(false)}
      onFocus={() => setApontado(true)}
      onBlur={() => setApontado(false)}
    >
      {equipe.id ? (
        <Link to={`/equipes/${encodeURIComponent(equipe.id)}`} className={styles.link}>
          {conteudo}
        </Link>
      ) : (
        <div className={styles.link}>{conteudo}</div>
      )}
    </article>
  );
}
