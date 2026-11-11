import { type ComponentProps, type ReactNode, useId } from 'react';
import styles from './Campo.module.css';

interface PropsDoCampo {
  rotulo: string;
  erro?: string | undefined;
  dica?: string | undefined;
}

function Moldura({
  id,
  rotulo,
  erro,
  dica,
  children,
}: PropsDoCampo & { id: string; children: ReactNode }) {
  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.rotulo}>
        {rotulo}
      </label>
      {children}
      {dica && !erro && (
        <p id={`${id}-dica`} className={styles.dica}>
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className={styles.erro} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

function descricao(id: string, erro?: string, dica?: string) {
  if (erro) {
    return `${id}-erro`;
  }

  return dica ? `${id}-dica` : undefined;
}

export function CampoDeTexto({
  rotulo,
  erro,
  dica,
  ...input
}: PropsDoCampo & ComponentProps<'input'>) {
  const id = useId();

  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} dica={dica}>
      <input
        {...input}
        id={id}
        className={styles.controle}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao(id, erro, dica)}
      />
    </Moldura>
  );
}

export function CampoDeSelecao({
  rotulo,
  erro,
  dica,
  children,
  ...select
}: PropsDoCampo & ComponentProps<'select'>) {
  const id = useId();

  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} dica={dica}>
      <select
        {...select}
        id={id}
        className={styles.controle}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao(id, erro, dica)}
      >
        {children}
      </select>
    </Moldura>
  );
}
