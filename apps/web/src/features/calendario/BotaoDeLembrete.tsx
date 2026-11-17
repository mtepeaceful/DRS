import { baixarIcs, type Compromisso, gerarIcs } from './lembrete';
import { useTextos } from '../../shared/i18n/idioma';
import styles from './BotaoDeLembrete.module.css';

const TEXTOS = {
  pt: 'Baixa um arquivo para o calendário do celular ou do computador, com aviso antes da largada',
  en: 'Downloads a file for your phone or computer calendar, with a reminder before the start',
};

interface Props {
  rotulo: string;
  nomeDoArquivo: string;
  compromissos: Compromisso[];
}

export function BotaoDeLembrete({ rotulo, nomeDoArquivo, compromissos }: Props) {
  const dica = useTextos(TEXTOS);

  if (compromissos.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.botao}
      title={dica}
      onClick={() => baixarIcs(nomeDoArquivo, gerarIcs(compromissos))}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icone}>
        <path d="M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
        <path d="M12 12v3l2 1" />
      </svg>
      {rotulo}
    </button>
  );
}
