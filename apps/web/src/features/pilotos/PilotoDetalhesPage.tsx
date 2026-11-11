import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { useSessaoAtiva } from '../../shared/api/sessao';
import { estiloDaEquipe } from '../../shared/lib/equipe';
import { nomeDoPais } from '../../shared/lib/paises';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { Confirmacao } from '../../shared/ui/Confirmacao';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { detalheDoPiloto, useExcluirPiloto } from './api';
import styles from './PilotoDetalhesPage.module.css';

const formatoDeData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

export function PilotoDetalhesPage() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const queryClient = useQueryClient();
  const piloto = useQuery(detalheDoPiloto(id));
  const excluir = useExcluirPiloto();
  const [confirmando, setConfirmando] = useState(false);
  const logado = useSessaoAtiva();

  if (piloto.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando piloto…</span>
      </div>
    );
  }

  if (piloto.isError) {
    const inexistente =
      piloto.error instanceof ErroDaApi && [400, 404].includes(piloto.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? 'Piloto não encontrado' : 'Não foi possível carregar o piloto'}
        acao={
          <Link to="/pilotos" className={botao.secundario}>
            Voltar aos pilotos
          </Link>
        }
      >
        {inexistente ? 'Ele pode ter sido excluído.' : mensagemDoErro(piloto.error)}
      </Aviso>
    );
  }

  const { nome, numero, pais, titulos, equipe, atualizadoEm } = piloto.data;

  function fecharConfirmacao() {
    setConfirmando(false);
    excluir.reset();
  }

  function confirmarExclusao() {
    excluir.mutate(id, {
      onSuccess: async () => {
        await navegar('/pilotos');
        queryClient.removeQueries({ queryKey: detalheDoPiloto(id).queryKey });
      },
    });
  }

  return (
    <>
      <title>{`${nome} · DRS`}</title>

      <Link to="/pilotos" className={styles.voltar} viewTransition>
        ← Grid
      </Link>

      <article className={styles.painel} style={estiloDaEquipe(equipe)}>
        <span className={styles.numero} aria-hidden="true">
          {numero}
        </span>

        <header className={styles.cabecalho}>
          <Link to={`/pilotos?busca=${encodeURIComponent(equipe.nome)}`} className={styles.equipe}>
            <SimboloDaEquipe {...equipe} tamanho="grande" />
            {equipe.nome}
          </Link>
          <h1 className={styles.nome}>{nome}</h1>
        </header>

        <dl className={styles.dados}>
          <div className={styles.dado}>
            <dt>País</dt>
            <dd className={styles.pais}>
              <Bandeira pais={pais} />
              {nomeDoPais(pais)}
            </dd>
          </div>
          <div className={titulos > 0 ? styles.dadoCampeao : styles.dado}>
            <dt>Títulos mundiais</dt>
            <dd>{titulos}</dd>
          </div>
        </dl>

        <footer className={styles.rodape}>
          <p className={styles.atualizacao}>
            Atualizado em {formatoDeData.format(new Date(atualizadoEm))}
          </p>
          {logado && (
            <div className={styles.acoes}>
              <Link to={`/pilotos/${id}/editar`} className={botao.primario}>
                Editar
              </Link>
              <button type="button" className={botao.perigo} onClick={() => setConfirmando(true)}>
                Excluir
              </button>
            </div>
          )}
        </footer>
      </article>

      <Confirmacao
        aberta={confirmando}
        titulo={`Excluir ${nome}?`}
        descricao="O piloto sai do grid e essa ação não pode ser desfeita."
        rotuloDeConfirmar="Excluir piloto"
        ocupada={excluir.isPending}
        erro={excluir.isError ? mensagemDoErro(excluir.error) : undefined}
        aoCancelar={fecharConfirmacao}
        aoConfirmar={confirmarExclusao}
      />
    </>
  );
}
