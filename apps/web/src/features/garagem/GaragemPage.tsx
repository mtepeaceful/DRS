import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { useTextos } from '../../shared/i18n/idioma';
import { detalheDoPiloto } from '../pilotos/api';
import { CarroIlustrado } from './CarroIlustrado';
import { Garagem3D } from './Garagem3D';
import styles from './GaragemPage.module.css';
import { aparelhoModesto, preferePoucoMovimento, temWebgl } from './suporte';

const TEXTOS = {
  pt: {
    piloto: '← Piloto',
    abrindo: '{t.abrindo}',
    naoEncontrado: 'Piloto não encontrado',
    erro: 'Não foi possível abrir a garagem',
    voltar: 'Voltar aos pilotos',
    excluido: 'Ele pode ter sido excluído.',
    titulo: (nome: string) => `Garagem de ${nome}`,
    garagem: 'Garagem 3D',
    estilo: 'Carro em estilo low-poly nas cores da equipe.',
    carro: 'Carro',
    drs: (aberto: boolean) => `DRS ${aberto ? 'aberto' : 'fechado'}`,
    girar: (girando: boolean): string => (girando ? 'Parar de girar' : 'Girar sozinho'),
    ver3d: 'Ver em 3D',
    dica3d: 'Arraste para girar e use a roda do mouse ou o gesto de pinça para aproximar.',
    dicaIlustracao:
      'Mostramos uma imagem parada para poupar o seu aparelho ou porque você prefere menos movimento.',
    dicaSem3d: 'Este navegador não consegue mostrar 3D, então mostramos o carro de lado.',
    oQueEDrs: 'O que é o DRS e por que ele saiu em 2026',
    pecas: 'O que cada peça do carro faz',
  },
  en: {
    piloto: '← Driver',
    abrindo: 'Opening the garage…',
    naoEncontrado: 'Driver not found',
    erro: 'Could not open the garage',
    voltar: 'Back to drivers',
    excluido: 'The driver may have been deleted.',
    titulo: (nome: string) => `${nome}’s garage`,
    garagem: '3D garage',
    estilo: 'Low-poly car in the team’s colours.',
    carro: 'Car',
    drs: (aberto: boolean) => `DRS ${aberto ? 'open' : 'closed'}`,
    girar: (girando: boolean): string => (girando ? 'Stop spinning' : 'Spin on its own'),
    ver3d: 'View in 3D',
    dica3d: 'Drag to rotate and use the mouse wheel or pinch to zoom.',
    dicaIlustracao: 'We show a still image to spare your device or because you prefer less motion.',
    dicaSem3d: 'This browser cannot show 3D, so we show the car from the side.',
    oQueEDrs: 'What DRS is and why it left in 2026',
    pecas: 'What each part of the car does',
  },
};

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
  const t = useTextos(TEXTOS);

  const voltar = (
    <Link to={`/pilotos/${id}`} className={styles.voltar} viewTransition>
      {t.piloto}
    </Link>
  );

  if (piloto.isPending) {
    return (
      <>
        {voltar}
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">{t.abrindo}</span>
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

  const { nome, numero, equipe } = piloto.data;
  const pintura = { cor: equipe.cor, corSecundaria: equipe.corSecundaria, numero };

  return (
    <>
      <title>{`${t.titulo(nome)} · DRS`}</title>
      {voltar}

      <header className={styles.topo}>
        <p className={styles.sobretitulo}>{t.garagem}</p>
        <h1 className={styles.titulo}>{nome}</h1>
        <p className={styles.resumo}>
          #{numero} · {nomeDaEquipe(equipe.nome)}. {t.estilo}
        </p>
      </header>

      <section className={styles.vitrine} aria-label={t.carro}>
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
            {t.drs(asaAberta)}
          </button>
          {modo === '3d' && (
            <button
              type="button"
              className={botao.secundario}
              aria-pressed={girando}
              onClick={() => setGirando((ativo) => !ativo)}
            >
              {t.girar(girando)}
            </button>
          )}
          {modo === 'ilustracao' && (
            <button type="button" className={botao.secundario} onClick={() => setModo('3d')}>
              {t.ver3d}
            </button>
          )}
        </div>

        <p className={styles.dica}>
          {modo === '3d' && t.dica3d}
          {modo === 'ilustracao' && t.dicaIlustracao}
          {modo === 'sem-3d' && t.dicaSem3d}
        </p>
        <p className={styles.dica}>
          <Link to="/glossario#drs" className={styles.saibaMais}>
            {t.oQueEDrs}
          </Link>
          {' · '}
          <Link to="/carro" className={styles.saibaMais}>
            {t.pecas}
          </Link>
          {' · '}
          <Link to="/garagem" className={styles.saibaMais}>
            Monte o carro de uma equipe com outras peças
          </Link>
        </p>
      </section>
    </>
  );
}
