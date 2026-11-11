import { Link } from 'react-router';
import { Aviso } from './Aviso';
import botao from './botao.module.css';

export function NaoEncontrada() {
  return (
    <>
      <title>Página não encontrada · DRS</title>
      <Aviso
        titulo="Essa página saiu da pista"
        acao={
          <Link to="/" className={botao.primario}>
            Voltar ao grid
          </Link>
        }
      >
        O endereço não existe ou foi movido.
      </Aviso>
    </>
  );
}
