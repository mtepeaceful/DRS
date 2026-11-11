import { Link } from 'react-router';
import { estiloDaEquipe } from '../../shared/lib/cor-da-equipe';
import styles from './CartaoDoPiloto.module.css';
import { rotuloDeTitulos } from './titulos';

interface Props {
  nome: string;
  numero: number | undefined;
  nacionalidade: string;
  titulos: number;
  equipe: string;
  para?: string;
}

export function CartaoDoPiloto({ nome, numero, nacionalidade, titulos, equipe, para }: Props) {
  const numeroValido = numero !== undefined && Number.isInteger(numero);

  return (
    <article className={styles.cartao} style={estiloDaEquipe(equipe)}>
      <span className={styles.numero} aria-hidden="true">
        {numeroValido ? numero : '–'}
      </span>

      <div className={styles.corpo}>
        <p className={styles.equipe}>
          <span className={styles.ponto} aria-hidden="true" />
          {equipe || 'Sem equipe'}
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
        <span>{nacionalidade || 'Nacionalidade'}</span>
        {titulos > 0 && <span className={styles.campeao}>{rotuloDeTitulos(titulos)}</span>}
      </div>
    </article>
  );
}
