import { type CoresDaEquipe, corDoTextoSobre, siglaDaEquipe } from '../../shared/lib/equipe';
import styles from './EmblemaDaEquipe.module.css';

export function EmblemaDaEquipe({ nome, cor, corSecundaria }: CoresDaEquipe & { nome: string }) {
  return (
    <svg className={styles.emblema} viewBox="0 0 40 22" aria-hidden="true">
      <path d="M6.5 1H39l-5.5 20H1Z" fill={cor} />
      <path d="M31 1h4l-5.5 20h-4Z" fill={corSecundaria} />
      <path className={styles.borda} d="M6.5 1H39l-5.5 20H1Z" />
      <text className={styles.sigla} x="15.5" y="15" fill={corDoTextoSobre(cor)}>
        {siglaDaEquipe(nome)}
      </text>
    </svg>
  );
}
