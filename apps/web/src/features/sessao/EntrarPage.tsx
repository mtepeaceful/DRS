import { type EntrarDTO, entrarSchema, sessaoSchema } from '@drs/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { buscar, mensagemDoErro } from '../../shared/api/http';
import { iniciarSessao, useSessaoAtiva } from '../../shared/api/sessao';
import botao from '../../shared/ui/botao.module.css';
import { CampoDeTexto } from '../../shared/ui/Campo';
import styles from './EntrarPage.module.css';

function destinoSeguro(destino: string | null) {
  return destino?.startsWith('/') && !destino.startsWith('//') ? destino : '/';
}

export function EntrarPage() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const logado = useSessaoAtiva();
  const destino = destinoSeguro(parametros.get('voltar'));
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntrarDTO>({ resolver: zodResolver(entrarSchema), defaultValues: { senha: '' } });

  if (logado) {
    return <Navigate to={destino} replace />;
  }

  async function entrar(dados: EntrarDTO) {
    try {
      const { token, expiraEm } = await buscar('/sessao', sessaoSchema, {
        method: 'POST',
        body: dados,
      });

      iniciarSessao(token, expiraEm);
      await navegar(destino, { replace: true });
    } catch (erro) {
      setError('senha', { message: mensagemDoErro(erro) }, { shouldFocus: true });
    }
  }

  return (
    <>
      <title>Entrar · DRS</title>
      <div className={styles.caixa}>
        <h1 className={styles.titulo}>Área do administrador</h1>
        <p className={styles.texto}>
          Qualquer pessoa pode ver o grid. Para cadastrar, editar ou excluir, entre com a senha de
          administrador.
        </p>
        <form className={styles.formulario} onSubmit={handleSubmit(entrar)} noValidate>
          <CampoDeTexto
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            maxLength={200}
            erro={errors.senha?.message}
            {...register('senha')}
          />
          <button type="submit" className={botao.primario} disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  );
}
