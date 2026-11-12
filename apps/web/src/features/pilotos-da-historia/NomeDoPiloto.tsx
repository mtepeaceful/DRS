import { Link } from 'react-router';
import { useLinkDoPiloto } from './api';

export function NomeDoPiloto({ nome, className }: { nome: string; className?: string }) {
  const link = useLinkDoPiloto()(nome);

  return link ? (
    <Link to={link} className={className}>
      {nome}
    </Link>
  ) : (
    <>{nome}</>
  );
}
