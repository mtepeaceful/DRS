import { useEffect, useId, useRef } from 'react';
import botao from './botao.module.css';
import styles from './Confirmacao.module.css';

interface Props {
  aberta: boolean;
  titulo: string;
  descricao: string;
  rotuloDeConfirmar: string;
  ocupada: boolean;
  erro?: string | undefined;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export function Confirmacao({
  aberta,
  titulo,
  descricao,
  rotuloDeConfirmar,
  ocupada,
  erro,
  aoConfirmar,
  aoCancelar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const elemento = dialogo.current;

    if (aberta && !elemento?.open) {
      elemento?.showModal();
    } else if (!aberta && elemento?.open) {
      elemento.close();
    }
  }, [aberta]);

  return (
    <dialog
      ref={dialogo}
      className={styles.dialogo}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-descricao`}
      onClose={aoCancelar}
    >
      <h2 id={`${id}-titulo`} className={styles.titulo}>
        {titulo}
      </h2>
      <p id={`${id}-descricao`} className={styles.descricao}>
        {descricao}
      </p>
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      <div className={styles.acoes}>
        <button type="button" className={botao.secundario} onClick={aoCancelar} disabled={ocupada}>
          Cancelar
        </button>
        <button type="button" className={botao.perigo} onClick={aoConfirmar} disabled={ocupada}>
          {ocupada ? 'Excluindo…' : rotuloDeConfirmar}
        </button>
      </div>
    </dialog>
  );
}
