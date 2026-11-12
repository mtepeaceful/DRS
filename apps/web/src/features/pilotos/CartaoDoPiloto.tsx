import type { EquipeDTO, FotoDTO } from '@drs/contracts';
import { Link } from 'react-router';
import { estiloDaEquipe } from '../../shared/lib/equipe';
import { nomeDoPais } from '../../shared/lib/paises';
import { Bandeira } from '../../shared/ui/Bandeira';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import styles from './CartaoDoPiloto.module.css';
import { rotuloDeTitulos } from './titulos';

interface Props {
  nome: string;
  numero: number | undefined;
  pais: string;
  titulos: number;
  equipe: EquipeDTO | undefined;
  para?: string;
  foto?: FotoDTO | undefined;
}

export function CartaoDoPiloto({ nome, numero, pais, titulos, equipe, para, foto }: Props) {
  const numeroValido = numero !== undefined && Number.isInteger(numero);

  return (
    <article className={styles.cartao} style={estiloDaEquipe(equipe)}>
      <span className={styles.numero} aria-hidden="true">
        {numeroValido ? numero : '–'}
      </span>

      {foto && (
        <img
          src={foto.url}
          alt=""
          title={['Foto', foto.autor, foto.licenca].filter(Boolean).join(' · ')}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={styles.retrato}
        />
      )}

      <div className={styles.corpo}>
        <p className={styles.equipe}>
          {equipe && <SimboloDaEquipe {...equipe} />}
          {equipe?.nome ?? 'Sem equipe'}
        </p>
        <h2 className={styles.nome}>
          {para ? (
            <Link to={para} className={styles.link} viewTransition>
              {nome || 'Nome do piloto'}
              {numeroValido && <span className="apenas-leitor">, número {numero}</span>}
            </Link>
          ) : (
            nome || 'Nome do piloto'
          )}
        </h2>
      </div>

      <div className={styles.rodape}>
        <span className={styles.pais}>
          <Bandeira pais={pais} />
          {pais ? nomeDoPais(pais) : 'País'}
        </span>
        {titulos > 0 && <span className={styles.campeao}>{rotuloDeTitulos(titulos)}</span>}
      </div>
    </article>
  );
}
