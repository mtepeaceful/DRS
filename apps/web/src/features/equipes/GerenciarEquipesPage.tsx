import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { useSessaoAtiva } from '../../shared/api/sessao';
import { estiloDaEquipe } from '../../shared/lib/equipe';
import { Aviso } from '../../shared/ui/Aviso';
import { listaDeEquipes } from './api';
import { SimboloDaEquipe } from './SimboloDaEquipe';
import { EquipeForm } from './EquipeForm';
import styles from './GerenciarEquipesPage.module.css';

export function GerenciarEquipesPage() {
  const equipes = useQuery(listaDeEquipes);
  const [editando, setEditando] = useState<string | null>(null);
  const logado = useSessaoAtiva();

  return (
    <>
      <title>Gerenciar equipes · DRS</title>
      <Link to="/equipes" className={styles.voltar}>
        ← Equipes
      </Link>
      <h1 className={styles.titulo}>Gerenciar equipes</h1>
      <p className={styles.resumo}>
        As cores de cada equipe aparecem no emblema e nos cartões dos seus pilotos. Equipes
        clássicas já chegam com as cores sugeridas.
      </p>

      {logado && (
        <div className={styles.novo}>
          <EquipeForm />
        </div>
      )}

      {equipes.isPending && (
        <div className={styles.esqueleto} role="status">
          <span className="apenas-leitor">Carregando equipes…</span>
        </div>
      )}

      {equipes.isError && (
        <Aviso tipo="erro" titulo="Não foi possível carregar as equipes">
          {mensagemDoErro(equipes.error)}
        </Aviso>
      )}

      {equipes.data?.length === 0 && (
        <Aviso titulo="Nenhuma equipe ainda">
          Adicione a primeira equipe acima para poder cadastrar pilotos.
        </Aviso>
      )}

      {equipes.data && equipes.data.length > 0 && (
        <ul className={styles.lista}>
          {equipes.data.map((equipe) =>
            editando === equipe.id ? (
              <li key={equipe.id} className={styles.edicao}>
                <EquipeForm
                  equipe={equipe}
                  aoConcluir={() => setEditando(null)}
                  aoCancelar={() => setEditando(null)}
                />
              </li>
            ) : (
              <li key={equipe.id} className={styles.item} style={estiloDaEquipe(equipe)}>
                <span className={styles.nome}>
                  <SimboloDaEquipe {...equipe} />
                  {equipe.nome}
                </span>
                <span className={styles.acoes}>
                  <Link
                    to={`/pilotos?busca=${encodeURIComponent(equipe.nome)}`}
                    className={styles.link}
                  >
                    Ver pilotos <span aria-hidden="true">→</span>
                    <span className="apenas-leitor"> da {equipe.nome}</span>
                  </Link>
                  {logado && (
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => setEditando(equipe.id)}
                    >
                      Editar<span className="apenas-leitor"> {equipe.nome}</span>
                    </button>
                  )}
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </>
  );
}
