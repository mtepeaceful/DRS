import { type DadosEquipeDTO, dadosEquipeSchema } from '@drs/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { mensagemDoErro } from '../../shared/api/http';
import { estiloDaEquipe } from '../../shared/lib/cor-da-equipe';
import { Aviso } from '../../shared/ui/Aviso';
import botao from '../../shared/ui/botao.module.css';
import { CampoDeTexto } from '../../shared/ui/Campo';
import { listaDeEquipes, useCadastrarEquipe } from './api';
import styles from './EquipesPage.module.css';

export function EquipesPage() {
  const equipes = useQuery(listaDeEquipes);
  const cadastrar = useCadastrarEquipe();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosEquipeDTO>({
    resolver: zodResolver(dadosEquipeSchema),
    defaultValues: { nome: '' },
  });

  async function enviar(dados: DadosEquipeDTO) {
    try {
      await cadastrar.mutateAsync(dados);
      reset();
    } catch (erro) {
      setError('nome', { message: mensagemDoErro(erro) }, { shouldFocus: true });
    }
  }

  return (
    <>
      <title>Equipes · DRS</title>
      <h1 className={styles.titulo}>Equipes</h1>
      <p className={styles.resumo}>
        Cada equipe recebe uma cor própria, usada nos cartões dos seus pilotos.
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        <CampoDeTexto
          rotulo="Nova equipe"
          placeholder="Ex.: McLaren"
          autoComplete="off"
          maxLength={100}
          erro={errors.nome?.message}
          {...register('nome')}
        />
        <button
          type="submit"
          className={`${botao.primario} ${styles.enviar}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adicionando…' : 'Adicionar'}
        </button>
      </form>

      {equipes.isPending && <div className={styles.esqueleto} aria-label="Carregando equipes" />}

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
          {equipes.data.map((equipe) => (
            <li key={equipe.id} className={styles.item} style={estiloDaEquipe(equipe.nome)}>
              <span className={styles.nome}>{equipe.nome}</span>
              <Link to={`/?busca=${encodeURIComponent(equipe.nome)}`} className={styles.link}>
                Ver pilotos <span aria-hidden="true">→</span>
                <span className="apenas-leitor"> da {equipe.nome}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
