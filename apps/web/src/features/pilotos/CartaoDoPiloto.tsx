import type { EquipeDTO } from '@drs/contracts';
import { Link } from 'react-router';
import { estiloDaEquipe } from '../../shared/lib/equipe';
import { nomeDoPais } from '../../shared/lib/paises';
import { Bandeira } from '../../shared/ui/Bandeira';
import { EmblemaDaEquipe } from '../equipes/EmblemaDaEquipe';
import styles from './CartaoDoPiloto.module.css';
import { rotuloDeTitulos } from './titulos';

interface Props {
  nome: string;
  numero: number | undefined;
  pais: string;
  titulos: number;
  equipe: EquipeDTO | undefined;
  para?: string;
}

export function CartaoDoPiloto({ nome, numero, pais, titulos, equipe, para }: Props) {
  const numeroValido = numero !== undefined && Number.isInteger(numero);

  return (
    <article className={styles.cartao} style={estiloDaEquipe(equipe)}>
      <span className={styles.numero} aria-hidden="true">
        {numeroValido ? numero : '–'}
      </span>

      <div className={styles.corpo}>
        <p className={styles.equipe}>
          {equipe && <EmblemaDaEquipe {...equipe} />}
          {equipe?.nome ?? 'Sem equipe'}
        </p>
        <h3 className={styles.nome}>
          {para ? (
            <Link to={para} className={styles.link} viewTransition>
              {nome || 'Nome do piloto'}
              {numeroValido && <span className="apenas-leitor">, número {numero}</span>}
            </Link>
          ) : (
            nome || 'Nome do piloto'
          )}
        </h3>
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
