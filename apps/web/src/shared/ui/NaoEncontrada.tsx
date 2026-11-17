import { Link } from 'react-router';
import { useTextos } from '../i18n/idioma';
import { Aviso } from './Aviso';
import botao from './botao.module.css';

const TEXTOS = {
  pt: {
    titulo: 'Página não encontrada',
    saiu: 'Essa página saiu da pista',
    voltar: 'Voltar ao início',
    texto: 'O endereço não existe ou foi movido.',
  },
  en: {
    titulo: 'Page not found',
    saiu: 'This page went off track',
    voltar: 'Back to home',
    texto: 'The address does not exist or has moved.',
  },
};

export function NaoEncontrada() {
  const t = useTextos(TEXTOS);

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>
      <Aviso
        titulo={t.saiu}
        acao={
          <Link to="/" className={botao.primario}>
            {t.voltar}
          </Link>
        }
      >
        {t.texto}
      </Aviso>
    </>
  );
}
