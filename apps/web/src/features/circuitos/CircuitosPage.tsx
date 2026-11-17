import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { codigoDoPais, nomeDoPaisEmPortugues } from '../../shared/lib/traducoes';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { useTextos } from '../../shared/i18n/idioma';
import { COMUNS } from '../../shared/i18n/comuns';
import { listaDeCircuitos } from './api';
import styles from './CircuitosPage.module.css';

const TEXTOS = {
  pt: {
    carregando: '{t.carregando}',
    erro: 'Não foi possível carregar os circuitos',
    titulo: 'Circuitos',
    resumo: (n: number) =>
      `As ${n} pistas que já receberam a Fórmula 1, com a história e os vencedores de cada uma.`,
    buscar: 'Buscar circuito',
    exemplo: 'Buscar por circuito, cidade ou país',
    soDoCalendario: (ano: number) => `Só os do calendário de ${ano}`,
    contagem: (n: number) => `${n} ${n === 1 ? 'circuito' : 'circuitos'}`,
    noCalendario: 'No calendário',
  },
  en: {
    carregando: 'Loading the circuits…',
    erro: 'Could not load the circuits',
    titulo: 'Circuits',
    resumo: (n: number) =>
      `The ${n} tracks that have hosted Formula 1, with the history and winners of each one.`,
    buscar: 'Search for a circuit',
    exemplo: 'Search by circuit, city or country',
    soDoCalendario: (ano: number) => `Only the ${ano} calendar`,
    contagem: (n: number) => `${n} ${n === 1 ? 'circuit' : 'circuits'}`,
    noCalendario: 'On the calendar',
  },
};

export function CircuitosPage() {
  const t = useTextos(TEXTOS);
  const comuns = useTextos(COMUNS);
  const circuitos = useQuery(listaDeCircuitos);
  const [busca, setBusca] = useState('');
  const [soDoCalendario, setSoDoCalendario] = useState(false);
  const termo = semAcento(useDeferredValue(busca).trim());

  if (circuitos.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">{t.carregando}</span>
      </div>
    );
  }

  if (circuitos.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo={t.erro}
        acao={
          <button type="button" className={botao.secundario} onClick={() => circuitos.refetch()}>
            {comuns.tentarDeNovo}
          </button>
        }
      >
        {mensagemDoErro(circuitos.error)}
      </Aviso>
    );
  }

  const encontrados = circuitos.data.filter(
    (circuito) =>
      (!soDoCalendario || circuito.noCalendarioAtual) &&
      semAcento(
        `${circuito.nome} ${circuito.cidade} ${circuito.pais} ${nomeDoPaisEmPortugues(circuito.pais)}`,
      ).includes(termo),
  );

  return (
    <>
      <title>{`${t.titulo} · DRS`}</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.resumo}>{t.resumo(circuitos.data.length)}</p>
      </header>

      <div className={styles.filtros}>
        <label htmlFor="busca-de-circuito" className="apenas-leitor">
          {t.buscar}
        </label>
        <input
          id="busca-de-circuito"
          type="search"
          className={styles.busca}
          placeholder={t.exemplo}
          maxLength={60}
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <label className={styles.opcao}>
          <input
            type="checkbox"
            checked={soDoCalendario}
            onChange={(evento) => setSoDoCalendario(evento.target.checked)}
          />
          {t.soDoCalendario(new Date().getFullYear())}
        </label>
      </div>
      <p className={styles.contagem} aria-live="polite">
        {t.contagem(encontrados.length)}
      </p>

      <ul className={styles.lista}>
        {encontrados.map((circuito) => (
          <li key={circuito.id}>
            <Link to={`/circuitos/${circuito.id}`} className={styles.linha}>
              <span className={styles.nome}>
                <Bandeira pais={codigoDoPais(circuito.pais)} />
                {circuito.nome}
              </span>
              <span className={styles.local}>
                {circuito.cidade}, {nomeDoPaisEmPortugues(circuito.pais)}
              </span>
              {circuito.noCalendarioAtual && <span className={styles.selo}>{t.noCalendario}</span>}
              <span className={styles.seta} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
