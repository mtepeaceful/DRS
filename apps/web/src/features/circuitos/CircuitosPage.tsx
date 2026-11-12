import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { codigoDoPais, nomeDoPaisEmPortugues } from '../../shared/lib/traducoes';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { listaDeCircuitos } from './api';
import styles from './CircuitosPage.module.css';

export function CircuitosPage() {
  const circuitos = useQuery(listaDeCircuitos);
  const [busca, setBusca] = useState('');
  const [soDoCalendario, setSoDoCalendario] = useState(false);
  const termo = semAcento(useDeferredValue(busca).trim());

  if (circuitos.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando os circuitos…</span>
      </div>
    );
  }

  if (circuitos.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar os circuitos"
        acao={
          <button type="button" className={botao.secundario} onClick={() => circuitos.refetch()}>
            Tentar de novo
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
      <title>Circuitos · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Circuitos</h1>
        <p className={styles.resumo}>
          As {circuitos.data.length} pistas que já receberam a Fórmula 1, com a história e os
          vencedores de cada uma.
        </p>
      </header>

      <div className={styles.filtros}>
        <label htmlFor="busca-de-circuito" className="apenas-leitor">
          Buscar circuito
        </label>
        <input
          id="busca-de-circuito"
          type="search"
          className={styles.busca}
          placeholder="Buscar por circuito, cidade ou país"
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
          Só os do calendário de {new Date().getFullYear()}
        </label>
      </div>
      <p className={styles.contagem} aria-live="polite">
        {encontrados.length} {encontrados.length === 1 ? 'circuito' : 'circuitos'}
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
              {circuito.noCalendarioAtual && <span className={styles.selo}>No calendário</span>}
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
