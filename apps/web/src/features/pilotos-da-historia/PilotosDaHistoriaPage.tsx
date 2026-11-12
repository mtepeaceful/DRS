import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { semAcento } from '../../shared/lib/texto';
import { Aviso } from '../../shared/ui/Aviso';
import { Bandeira } from '../../shared/ui/Bandeira';
import botao from '../../shared/ui/botao.module.css';
import { pilotosDaHistoria } from './api';
import styles from './PilotosDaHistoriaPage.module.css';

const LIMITE_DA_BUSCA = 60;

export function PilotosDaHistoriaPage() {
  const pilotos = useQuery(pilotosDaHistoria);
  const [busca, setBusca] = useState('');
  const termo = semAcento(useDeferredValue(busca).trim());

  if (pilotos.isPending) {
    return (
      <div className={styles.esqueleto} role="status">
        <span className="apenas-leitor">Carregando os pilotos…</span>
      </div>
    );
  }

  if (pilotos.isError) {
    return (
      <Aviso
        tipo="erro"
        titulo="Não foi possível carregar os pilotos"
        acao={
          <button type="button" className={botao.secundario} onClick={() => pilotos.refetch()}>
            Tentar de novo
          </button>
        }
      >
        {mensagemDoErro(pilotos.error)}
      </Aviso>
    );
  }

  const encontrados = termo
    ? pilotos.data.filter((piloto) => semAcento(piloto.nome).includes(termo))
    : pilotos.data
        .filter((piloto) => piloto.titulos > 0)
        .toSorted((a, b) => b.titulos - a.titulos || a.nome.localeCompare(b.nome, 'pt-BR'));
  const visiveis = encontrados.slice(0, LIMITE_DA_BUSCA);

  return (
    <>
      <title>Pilotos da história · DRS</title>

      <header className={styles.topo}>
        <h1 className={styles.titulo}>Pilotos da história</h1>
        <p className={styles.resumo}>
          Os {pilotos.data.length} pilotos que já correram na Fórmula 1 desde 1950. Busque qualquer
          um pelo nome, de Fangio a Bortoleto.
        </p>
      </header>

      <label htmlFor="busca-de-piloto" className="apenas-leitor">
        Buscar piloto
      </label>
      <input
        id="busca-de-piloto"
        type="search"
        className={styles.busca}
        placeholder="Buscar piloto pelo nome"
        maxLength={60}
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />

      <h2 className={styles.tituloDaLista} aria-live="polite">
        {termo
          ? `${encontrados.length} ${encontrados.length === 1 ? 'piloto encontrado' : 'pilotos encontrados'}`
          : 'Campeões mundiais'}
      </h2>
      {encontrados.length > LIMITE_DA_BUSCA && (
        <p className={styles.aviso}>
          Mostrando os {LIMITE_DA_BUSCA} primeiros. Digite mais do nome para encontrar quem você
          procura.
        </p>
      )}

      <ul className={styles.lista}>
        {visiveis.map((piloto) => (
          <li key={piloto.id}>
            <Link to={`/historia/pilotos/${piloto.id}`} className={styles.linha}>
              <span className={styles.nome}>
                {piloto.pais ? (
                  <Bandeira pais={piloto.pais} />
                ) : (
                  <span className={styles.semBandeira} />
                )}
                {piloto.nome}
              </span>
              {piloto.nascimento && (
                <span className={styles.nascimento}>Nasceu em {piloto.nascimento.slice(0, 4)}</span>
              )}
              {piloto.titulos > 0 && (
                <span className={styles.selo}>
                  {piloto.titulos} {piloto.titulos === 1 ? 'título' : 'títulos'}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
