import { Navigate, Outlet, useLocation } from 'react-router';
import { useSessaoAtiva } from '../../shared/api/sessao';

export function ApenasAdministrador() {
  const logado = useSessaoAtiva();
  const { pathname, search } = useLocation();

  if (!logado) {
    return <Navigate to={`/entrar?voltar=${encodeURIComponent(pathname + search)}`} replace />;
  }

  return <Outlet />;
}
