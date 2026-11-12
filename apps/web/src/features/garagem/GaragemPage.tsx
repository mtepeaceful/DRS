import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { detalheDoPiloto } from '../pilotos/api';
import { CarroIlustrado } from './CarroIlustrado';
import { Garagem3D } from './Garagem3D';
import styles from './GaragemPage.module.css';
import { aparelhoModesto, preferePoucoMovimento, temWebgl } from './suporte';

function modoInicial() {
  if (!temWebgl()) {
    return 'sem-3d' as const;
  }

  return preferePoucoMovimento() || aparelhoModesto() ? ('ilustracao' as const) : ('3d' as const);
}

export function GaragemPage() {
  const { id = '' } = useParams();
  const piloto = useQuery(detalheDoPiloto(id));
  const [modo, setModo] = useState(modoInicial);
  const [asaAberta, setAsaAberta] = useState(false);
  const [girando, setGirando] = useState(() => !preferePoucoMovimento());

  const voltar = (
    <Link to={`/pilotos/${id}`} className={styles.voltar} viewTransition>
      ← Piloto
    </Link>
  );

  if (piloto.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Abrindo a garagem…</span>
        </div>
      </>
    );
  }

  if (piloto.isError) {
    const inexistente =
      piloto.error instanceof ErroDaApi && [400, 404].includes(piloto.error.status);

    return (
      <Aviso
        tipo="erro"
        titulo={inexistente ? 'Piloto não encontrado' : 'Não foi possível abrir a garagem'}
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

  const { nome, numero, equipe } = piloto.data;
  const pintura = { cor: equipe.cor, corSecundaria: equipe.corSecundaria, numero };

  return (
    <>
      <title>{`Garagem de ${nome} · DRS`}</title>
      {voltar}

      <header className={styles.topo}>
        <p className={styles.sobretitulo}>Garagem 3D</p>
        <h1 className={styles.titulo}>{nome}</h1>
        <p className={styles.resumo}>
          #{numero} · {nomeDaEquipe(equipe.nome)}. Carro em estilo low-poly nas cores da equipe.
        </p>
      </header>

      <section className={styles.vitrine} aria-label="Carro">
        {modo === '3d' ? (
          <Garagem3D {...pintura} asaAberta={asaAberta} girando={girando} />
        ) : (
          <CarroIlustrado {...pintura} asaAberta={asaAberta} />
        )}

        <div className={styles.controles}>
          <button
            type="button"
            className={asaAberta ? styles.drsAtivo : styles.drs}
            aria-pressed={asaAberta}
            onClick={() => setAsaAberta((aberta) => !aberta)}
          >
            DRS {asaAberta ? 'aberto' : 'fechado'}
          </button>
          {modo === '3d' && (
            <button
              type="button"
              className={botao.secundario}
              aria-pressed={girando}
              onClick={() => setGirando((ativo) => !ativo)}
            >
              {girando ? 'Parar de girar' : 'Girar sozinho'}
            </button>
          )}
          {modo === 'ilustracao' && (
            <button type="button" className={botao.secundario} onClick={() => setModo('3d')}>
              Ver em 3D
            </button>
          )}
        </div>

        <p className={styles.dica}>
          {modo === '3d' &&
            'Arraste para girar e use a roda do mouse ou o gesto de pinça para aproximar.'}
          {modo === 'ilustracao' &&
            'Mostramos uma imagem parada para poupar o seu aparelho ou porque você prefere menos movimento.'}
          {modo === 'sem-3d' &&
            'Este navegador não consegue mostrar 3D, então mostramos o carro de lado.'}
        </p>
        <p className={styles.dica}>
          <Link to="/glossario#drs" className={styles.saibaMais}>
            O que é o DRS e por que ele saiu em 2026
          </Link>
          {' · '}
          <Link to="/carro" className={styles.saibaMais}>
            O que cada peça do carro faz
          </Link>
        </p>
      </section>
    </>
  );
}
