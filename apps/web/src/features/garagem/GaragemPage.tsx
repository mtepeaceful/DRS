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
import { pinturaDaEquipe } from './pinturas';
import { preferePoucoMovimento, temWebgl } from './suporte';

const TEXTOS = {
  pt: {
    piloto: '← Piloto',
    abrindo: 'Abrindo a garagem…',
    naoEncontrado: 'Piloto não encontrado',
    erro: 'Não foi possível abrir a garagem',
    voltar: 'Voltar aos pilotos',
    excluido: 'Ele pode ter sido excluído.',
    titulo: (nome: string) => `Garagem de ${nome}`,
    garagem: 'Garagem 3D',
    estilo: 'Carro realista nas cores da equipe, com as formas de um F1 de 2026.',
    carro: 'Carro',
    drs: (aberto: boolean) => `DRS ${aberto ? 'aberto' : 'fechado'}`,
    girar: (girando: boolean): string => (girando ? 'Parar de girar' : 'Girar sozinho'),
    dica3d: 'Arraste para girar e use a roda do mouse ou o gesto de pinça para aproximar.',
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
    estilo: 'Realistic car in the team’s colours, shaped like a 2026 F1 car.',
    carro: 'Car',
    drs: (aberto: boolean) => `DRS ${aberto ? 'open' : 'closed'}`,
    girar: (girando: boolean): string => (girando ? 'Stop spinning' : 'Spin on its own'),
    dica3d: 'Drag to rotate and use the mouse wheel or pinch to zoom.',
    dicaSem3d: 'This browser cannot show 3D, so we show the car from the side.',
    oQueEDrs: 'What DRS is and why it left in 2026',
    pecas: 'What each part of the car does',
  },
};

// O carro 3D aparece sempre que o navegador tem WebGL. Quem prefere menos
// movimento vê o mesmo carro, só que parado; a imagem de lado fica para
// navegadores sem 3D.
function modoInicial() {
  return temWebgl() ? ('3d' as const) : ('sem-3d' as const);
}

export function GaragemPage() {
  const { id = '' } = useParams();
  const piloto = useQuery(detalheDoPiloto(id));
  const [modo] = useState(modoInicial);
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
  const pintura = { ...pinturaDaEquipe(equipe.nome, equipe), numero };

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
        </div>

        <p className={styles.dica}>
          {modo === '3d' && t.dica3d}
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
