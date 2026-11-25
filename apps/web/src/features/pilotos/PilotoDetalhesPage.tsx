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
import { FotoDoCommons } from '../../shared/ui/FotoDoCommons';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import { detalheDoPiloto, useExcluirPiloto } from './api';
import styles from './PilotoDetalhesPage.module.css';
import { CarreiraDoPiloto, TemporadaDoPiloto } from './RaioXDoPiloto';
import { porIdioma, useTextos } from '../../shared/i18n/idioma';

const TEXTOS = {
  pt: {
    carregando: 'Carregando piloto…',
    naoEncontrado: 'Piloto não encontrado',
    erro: 'Não foi possível carregar o piloto',
    voltar: 'Voltar aos pilotos',
    excluido: 'Ele pode ter sido excluído.',
    grid: '← Grid',
    fotoDe: (nome: string) => `Foto de ${nome}`,
    pais: 'País',
    titulos: 'Títulos mundiais',
    atualizado: (data: string) => `Atualizado em ${data}`,
    carro3d: 'Ver o carro em 3D →',
    comparar: 'Comparar com outro piloto →',
    editar: 'Editar',
    excluir: 'Excluir',
    excluirNome: (nome: string) => `Excluir ${nome}?`,
    descricaoExclusao: 'O piloto sai do grid e essa ação não pode ser desfeita.',
    excluirPiloto: 'Excluir piloto',
  },
  en: {
    carregando: 'Loading driver…',
    naoEncontrado: 'Driver not found',
    erro: 'Could not load the driver',
    voltar: 'Back to the drivers',
    excluido: 'They may have been deleted.',
    grid: '← Grid',
    fotoDe: (nome: string) => `Photo of ${nome}`,
    pais: 'Country',
    titulos: 'World titles',
    atualizado: (data: string) => `Updated on ${data}`,
    carro3d: 'See the car in 3D →',
    comparar: 'Compare with another driver →',
    editar: 'Edit',
    excluir: 'Delete',
    excluirNome: (nome: string) => `Delete ${nome}?`,
    descricaoExclusao: 'The driver leaves the grid and this cannot be undone.',
    excluirPiloto: 'Delete driver',
  },
};

const formatoDeData = porIdioma((locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }));

export function PilotoDetalhesPage() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const queryClient = useQueryClient();
  const piloto = useQuery(detalheDoPiloto(id));
  const excluir = useExcluirPiloto();
  const [confirmando, setConfirmando] = useState(false);
  const logado = useSessaoAtiva();
  const t = useTextos(TEXTOS);

  if (piloto.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (piloto.isError) {
    const inexistente =
      piloto.error instanceof ErroDaApi && [400, 404].includes(piloto.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? t.naoEncontrado : t.erro}
        acao={
          <Link to="/pilotos" className={botao.secundario}>
            {t.voltar}
          </Link>
        }
      >
        {inexistente ? t.excluido : mensagemDoErro(piloto.error)}
      </Aviso>
    );
  }

  const { nome, numero, pais, titulos, equipe, foto, atualizadoEm } = piloto.data;

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
        {t.grid}
      </Link>

      <article className={styles.painel} style={estiloDaEquipe(equipe)}>
        <span className={styles.numero} aria-hidden="true">
          {numero}
        </span>

        <div className={styles.topo}>
          <header className={styles.cabecalho}>
            <Link
              to={`/pilotos?busca=${encodeURIComponent(equipe.nome)}`}
              className={styles.equipe}
            >
              <SimboloDaEquipe {...equipe} tamanho="grande" />
              {equipe.nome}
            </Link>
            <h1 className={styles.nome}>{nome}</h1>
          </header>
          {foto && (
            <FotoDoCommons
              foto={foto}
              descricao={t.fotoDe(nome)}
              className={styles.foto}
              substituto={
                <div className={styles.semFoto} aria-hidden="true">
                  {numero}
                </div>
              }
            />
          )}
        </div>

        <dl className={styles.dados}>
          <div className={styles.dado}>
            <dt>{t.pais}</dt>
            <dd className={styles.pais}>
              <Bandeira pais={pais} />
              {nomeDoPais(pais)}
            </dd>
          </div>
          <div className={titulos > 0 ? styles.dadoCampeao : styles.dado}>
            <dt>{t.titulos}</dt>
            <dd>{titulos}</dd>
          </div>
        </dl>

        <footer className={styles.rodape}>
          <p className={styles.atualizacao}>
            {t.atualizado(formatoDeData().format(new Date(atualizadoEm)))}
          </p>
          <span className={styles.atalhos}>
            <Link to={`/pilotos/${id}/garagem`} className={styles.comparar}>
              {t.carro3d}
            </Link>
            <Link to={`/comparar?${new URLSearchParams({ a: nome })}`} className={styles.comparar}>
              {t.comparar}
            </Link>
          </span>
          {logado && (
            <div className={styles.acoes}>
              <Link to={`/pilotos/${id}/editar`} className={botao.primario}>
                {t.editar}
              </Link>
              <button type="button" className={botao.perigo} onClick={() => setConfirmando(true)}>
                {t.excluir}
              </button>
            </div>
          )}
        </footer>
      </article>

      <TemporadaDoPiloto nome={nome} />
      <CarreiraDoPiloto id={id} />

      <Confirmacao
        aberta={confirmando}
        titulo={t.excluirNome(nome)}
        descricao={t.descricaoExclusao}
        rotuloDeConfirmar={t.excluirPiloto}
        ocupada={excluir.isPending}
        erro={excluir.isError ? mensagemDoErro(excluir.error) : undefined}
        aoCancelar={fecharConfirmacao}
        aoConfirmar={confirmarExclusao}
      />
    </>
  );
}
