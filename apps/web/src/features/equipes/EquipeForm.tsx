import { type DadosEquipeDTO, dadosEquipeSchema, type EquipeDTO } from '@drs/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useController, useForm, useWatch } from 'react-hook-form';
import { mensagemDoErro } from '../../shared/api/http';
import botao from '../../shared/ui/botao.module.css';
import { CampoDeTexto } from '../../shared/ui/Campo';
import { useSalvarEquipe } from './api';
import { coresSugeridas } from './cores-classicas';
import { EmblemaDaEquipe } from './EmblemaDaEquipe';
import styles from './EquipeForm.module.css';

interface Props {
  equipe?: EquipeDTO;
  aoConcluir?: () => void;
  aoCancelar?: () => void;
}

export function EquipeForm({ equipe, aoConcluir, aoCancelar }: Props) {
  const salvar = useSalvarEquipe(equipe?.id);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<DadosEquipeDTO>({
    resolver: zodResolver(dadosEquipeSchema),
    defaultValues: equipe ?? { nome: '', ...coresSugeridas('') },
  });
  const previa = useWatch({ control });
  const cor = useController({ control, name: 'cor' });
  const corSecundaria = useController({ control, name: 'corSecundaria' });

  function sugerirCores(nome: string) {
    if (equipe || dirtyFields.cor || dirtyFields.corSecundaria) {
      return;
    }

    const cores = coresSugeridas(nome);
    setValue('cor', cores.cor);
    setValue('corSecundaria', cores.corSecundaria);
  }

  async function enviar(dados: DadosEquipeDTO) {
    try {
      await salvar.mutateAsync(dados);
      reset(equipe ? dados : undefined);
      aoConcluir?.();
    } catch (erro) {
      setError('nome', { message: mensagemDoErro(erro) }, { shouldFocus: true });
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
      <div className={styles.nome}>
        <CampoDeTexto
          rotulo={equipe ? 'Nome' : 'Nova equipe'}
          placeholder="Ex.: McLaren"
          autoComplete="off"
          maxLength={100}
          erro={errors.nome?.message}
          {...register('nome', { onChange: (evento) => sugerirCores(evento.target.value) })}
        />
      </div>
      <CampoDeTexto rotulo="Cor principal" type="color" erro={errors.cor?.message} {...cor.field} />
      <CampoDeTexto
        rotulo="Cor secundária"
        type="color"
        erro={errors.corSecundaria?.message}
        {...corSecundaria.field}
      />

      <div className={styles.rodape}>
        <span className={styles.previa}>
          <EmblemaDaEquipe
            nome={previa.nome ?? ''}
            cor={previa.cor ?? '#8a8d96'}
            corSecundaria={previa.corSecundaria ?? '#ffffff'}
          />
          {previa.nome || 'Prévia do emblema'}
        </span>
        <div className={styles.acoes}>
          {aoCancelar && (
            <button type="button" className={botao.secundario} onClick={aoCancelar}>
              Cancelar
            </button>
          )}
          <button type="submit" className={botao.primario} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : equipe ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </form>
  );
}
