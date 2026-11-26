import { useEffect, useId, useRef, useState } from 'react';
import { localeDo, useIdioma, useTextos } from '../../shared/i18n/idioma';
import { baixarIcs, type Compromisso, gerarIcs, linkDoGoogle, linkDoOutlook } from './lembrete';
import styles from './BotaoDeLembrete.module.css';

const TEXTOS = {
  pt: {
    titulo: 'Lembrar no calendário',
    resumo: (total: number) =>
      total === 1
        ? '1 evento, com o horário já no seu fuso.'
        : `${total} eventos, com os horários já no seu fuso.`,
    fechar: 'Fechar',
    arquivoTitulo: 'Tudo de uma vez',
    arquivoApps: 'iPhone, Mac, Android e Outlook',
    arquivoExplica:
      'Baixa um arquivo .ics. Abra o arquivo e o app de calendário pergunta se você quer adicionar os eventos, já com aviso antes da largada.',
    baixar: 'Baixar arquivo .ics',
    baixado: (arquivo: string) =>
      `Pronto, ${arquivo} está nos seus downloads. Abra o arquivo para adicionar ao calendário.`,
    googleImportar: 'Usa Google Agenda? Dá para importar o arquivo em',
    googleConfiguracoes: 'Configurações › Importar',
    umPorUmTitulo: 'Um por um',
    umPorUmExplica: 'Abre o evento já preenchido na sua conta. É só salvar.',
    google: 'Google',
    outlook: 'Outlook',
    adicionarNo: (servico: string, evento: string) => `Adicionar ${evento} no ${servico}`,
  },
  en: {
    titulo: 'Add to calendar',
    resumo: (total: number) =>
      total === 1
        ? '1 event, already in your time zone.'
        : `${total} events, already in your time zone.`,
    fechar: 'Close',
    arquivoTitulo: 'All at once',
    arquivoApps: 'iPhone, Mac, Android and Outlook',
    arquivoExplica:
      'Downloads an .ics file. Open it and your calendar app asks whether to add the events, with a reminder before the start.',
    baixar: 'Download .ics file',
    baixado: (arquivo: string) =>
      `Done, ${arquivo} is in your downloads. Open it to add it to your calendar.`,
    googleImportar: 'On Google Calendar? You can import the file in',
    googleConfiguracoes: 'Settings › Import',
    umPorUmTitulo: 'One by one',
    umPorUmExplica: 'Opens the event already filled in on your account. Just save it.',
    google: 'Google',
    outlook: 'Outlook',
    adicionarNo: (servico: string, evento: string) => `Add ${evento} to ${servico}`,
  },
};

const IMPORTAR_NO_GOOGLE = 'https://calendar.google.com/calendar/r/settings/export';

interface Props {
  rotulo: string;
  nomeDoArquivo: string;
  compromissos: Compromisso[];
}

function IconeDeCalendario() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icone}>
      <path d="M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M12 12v3l2 1" />
    </svg>
  );
}

export function BotaoDeLembrete({ rotulo, nomeDoArquivo, compromissos }: Props) {
  const t = useTextos(TEXTOS);
  const idioma = useIdioma();
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [baixado, setBaixado] = useState(false);

  useEffect(() => {
    const elemento = dialogo.current;

    if (!elemento) return;

    if (aberto && !elemento.open) {
      elemento.showModal();
    } else if (!aberto && elemento.open) {
      elemento.close();
    }
  }, [aberto]);

  if (compromissos.length === 0) {
    return null;
  }

  const data = new Intl.DateTimeFormat(localeDo(idioma), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  function fechar() {
    setAberto(false);
    setBaixado(false);
  }

  return (
    <>
      <button
        type="button"
        className={styles.botao}
        aria-haspopup="dialog"
        onClick={() => setAberto(true)}
      >
        <IconeDeCalendario />
        {rotulo}
      </button>

      <dialog
        ref={dialogo}
        className={styles.dialogo}
        aria-labelledby={`${id}-titulo`}
        onClose={fechar}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar();
        }}
      >
        <div className={styles.conteudo}>
          <header className={styles.cabecalho}>
            <div>
              <h2 id={`${id}-titulo`} className={styles.titulo}>
                {t.titulo}
              </h2>
              <p className={styles.resumo}>{t.resumo(compromissos.length)}</p>
            </div>
            <button type="button" className={styles.fechar} aria-label={t.fechar} onClick={fechar}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <section className={styles.opcao} aria-labelledby={`${id}-arquivo`}>
            <p className={styles.sobretitulo}>{t.arquivoApps}</p>
            <h3 id={`${id}-arquivo`} className={styles.tituloDaOpcao}>
              {t.arquivoTitulo}
            </h3>
            <p className={styles.explicacao}>{t.arquivoExplica}</p>
            <button
              type="button"
              className={styles.baixar}
              onClick={() => {
                baixarIcs(nomeDoArquivo, gerarIcs(compromissos));
                setBaixado(true);
              }}
            >
              <IconeDeCalendario />
              {t.baixar}
            </button>
            {baixado && (
              <p className={styles.baixado} role="status">
                {t.baixado(nomeDoArquivo)}
              </p>
            )}
            <p className={styles.nota}>
              {t.googleImportar}{' '}
              <a href={IMPORTAR_NO_GOOGLE} target="_blank" rel="noreferrer">
                {t.googleConfiguracoes}
              </a>
              .
            </p>
          </section>

          <section className={styles.opcao} aria-labelledby={`${id}-um-por-um`}>
            <p className={styles.sobretitulo}>Google · Outlook</p>
            <h3 id={`${id}-um-por-um`} className={styles.tituloDaOpcao}>
              {t.umPorUmTitulo}
            </h3>
            <p className={styles.explicacao}>{t.umPorUmExplica}</p>
            <ul className={styles.eventos}>
              {compromissos.map((compromisso) => (
                <li key={compromisso.id} className={styles.evento}>
                  <div className={styles.dadosDoEvento}>
                    <span className={styles.nomeDoEvento}>{compromisso.titulo}</span>
                    <span className={styles.dataDoEvento}>{data.format(compromisso.inicio)}</span>
                  </div>
                  <div className={styles.links}>
                    <a
                      href={linkDoGoogle(compromisso)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t.adicionarNo('Google', compromisso.titulo)}
                    >
                      {t.google}
                    </a>
                    <a
                      href={linkDoOutlook(compromisso)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t.adicionarNo('Outlook', compromisso.titulo)}
                    >
                      {t.outlook}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </dialog>
    </>
  );
}
