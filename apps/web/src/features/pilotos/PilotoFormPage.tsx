import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { listaDeEquipes } from '../equipes/api';
import { detalheDoPiloto } from './api';
import { PilotoForm } from './PilotoForm';
import styles from './PilotoFormPage.module.css';

function Conteudo({ id }: { id: string | undefined }) {
  const equipes = useQuery(listaDeEquipes);
  const piloto = useQuery({ ...detalheDoPiloto(id ?? ''), enabled: Boolean(id) });
  const erro = equipes.error ?? piloto.error;

  if (erro) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível abrir o formulário"
        acao={
          <Link to="/" className={botao.secundario}>
            Voltar ao grid
          </Link>
        }
      >
        {mensagemDoErro(erro)}
      </Aviso>
    );
  }

  if (!equipes.data || (id && !piloto.data)) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando formulário…</span>
      </div>
    );
  }

  if (equipes.data.length === 0) {
    return (
      <Aviso
        titulo="Cadastre uma equipe primeiro"
        acao={
          <Link to="/equipes" className={botao.primario}>
            Ir para equipes
          </Link>
        }
      >
        Todo piloto corre por uma equipe, e ainda não há nenhuma cadastrada.
      </Aviso>
    );
  }

  return piloto.data ? (
    <PilotoForm equipes={equipes.data} piloto={piloto.data} />
  ) : (
    <PilotoForm equipes={equipes.data} />
  );
}

export function PilotoFormPage() {
  const { id } = useParams();
  const titulo = id ? 'Editar piloto' : 'Novo piloto';

  return (
    <>
      <title>{`${titulo} · DRS`}</title>
      <h1 className={styles.titulo}>{titulo}</h1>
      <Conteudo key={id ?? 'novo'} id={id} />
    </>
  );
}
