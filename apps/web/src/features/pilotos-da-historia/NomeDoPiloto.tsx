import { Link } from 'react-router';
import { useLinkDoPiloto } from './api';
import styles from './NomeDoPiloto.module.css';

export function NomeDoPiloto({ nome }: { nome: string }) {
  const link = useLinkDoPiloto()(nome);

  return link ? (
    <Link to={link} className={styles.link}>
      {nome}
    </Link>
  ) : (
    <>{nome}</>
  );
}
