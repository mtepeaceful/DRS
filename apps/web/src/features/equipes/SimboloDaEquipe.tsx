import type { CoresDaEquipe } from '../../shared/lib/equipe';
import { EmblemaDaEquipe } from './EmblemaDaEquipe';
import styles from './SimboloDaEquipe.module.css';

const arquivos = import.meta.glob<string>('../../shared/logos/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

const LOGOS_ESCUROS = new Set(['alpine', 'haas-f1-team', 'mclaren', 'williams']);

const logos = new Map(
  Object.entries(arquivos).map(([caminho, url]) => [
    caminho.slice(caminho.lastIndexOf('/') + 1, -'.svg'.length),
    url,
  ]),
);

function identificador(nome: string) {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Props extends CoresDaEquipe {
  nome: string;
  tamanho?: 'pequeno' | 'grande';
}

export function SimboloDaEquipe({ nome, tamanho = 'pequeno', ...cores }: Props) {
  const chave = identificador(nome);
  const url = logos.get(chave);

  if (!url) {
    return <EmblemaDaEquipe nome={nome} {...cores} />;
  }

  return (
    <span
      className={styles[tamanho]}
      data-fundo-claro={LOGOS_ESCUROS.has(chave) || undefined}
      aria-hidden="true"
    >
      <img src={url} alt="" loading="lazy" decoding="async" className={styles.logo} />
    </span>
  );
}
