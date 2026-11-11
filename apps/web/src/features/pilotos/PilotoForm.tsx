import {
  type DadosPilotoDTO,
  dadosPilotoSchema,
  type EquipeDTO,
  NUMERO_MAXIMO,
  NUMERO_MINIMO,
  type PilotoDTO,
} from '@drs/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import type { z } from 'zod';
import { ErroDaApi, mensagemDoErro } from '../../shared/api/http';
import botao from '../../shared/ui/botao.module.css';
import { CampoDeSelecao, CampoDeTexto } from '../../shared/ui/Campo';
import { useSalvarPiloto } from './api';
import { CartaoDoPiloto } from './CartaoDoPiloto';
import styles from './PilotoForm.module.css';

type Entrada = z.input<typeof dadosPilotoSchema>;

const campos = ['nome', 'numero', 'nacionalidade', 'equipeId', 'titulos'] as const;

function numeroOuVazio(valor: string) {
  return valor === '' ? undefined : Number(valor);
}

interface Props {
  equipes: EquipeDTO[];
  piloto?: PilotoDTO;
}

export function PilotoForm({ equipes, piloto }: Props) {
  const navegar = useNavigate();
  const salvar = useSalvarPiloto(piloto?.id);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Entrada, unknown, DadosPilotoDTO>({
    resolver: zodResolver(dadosPilotoSchema),
    defaultValues: piloto
      ? {
          nome: piloto.nome,
          numero: piloto.numero,
          nacionalidade: piloto.nacionalidade,
          equipeId: piloto.equipe.id,
          titulos: piloto.titulos,
        }
      : { nome: '', nacionalidade: '', equipeId: '', titulos: 0 },
  });
  const previa = useWatch({ control });
  const voltarPara = piloto ? `/pilotos/${piloto.id}` : '/';

  async function enviar(dados: DadosPilotoDTO) {
    try {
      const salvo = await salvar.mutateAsync(dados);
      await navegar(`/pilotos/${salvo.id}`);
    } catch (erro) {
      if (erro instanceof ErroDaApi && erro.erro.codigo === 'NUMERO_JA_EM_USO') {
        setError('numero', { message: erro.message }, { shouldFocus: true });
        return;
      }

      if (erro instanceof ErroDaApi && erro.erro.campos) {
        for (const campo of campos) {
          const mensagem = erro.erro.campos[campo]?.[0];

          if (mensagem) {
            setError(campo, { message: mensagem });
          }
        }
        return;
      }

      setError('root', { message: mensagemDoErro(erro) });
    }
  }

  return (
    <div className={styles.disposicao}>
      <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        <CampoDeTexto
          rotulo="Nome completo"
          placeholder="Ex.: Ayrton Senna"
          autoComplete="off"
          maxLength={255}
          erro={errors.nome?.message}
          {...register('nome')}
        />

        <div className={styles.linha}>
          <CampoDeSelecao rotulo="Equipe" erro={errors.equipeId?.message} {...register('equipeId')}>
            <option value="">Selecione</option>
            {equipes.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </option>
            ))}
          </CampoDeSelecao>
          <CampoDeTexto
            rotulo="Nacionalidade"
            placeholder="Ex.: Brasileiro"
            autoComplete="off"
            maxLength={100}
            erro={errors.nacionalidade?.message}
            {...register('nacionalidade')}
          />
        </div>

        <div className={styles.linha}>
          <CampoDeTexto
            rotulo="Número"
            type="number"
            inputMode="numeric"
            min={NUMERO_MINIMO}
            max={NUMERO_MAXIMO}
            placeholder="12"
            dica={`De ${NUMERO_MINIMO} a ${NUMERO_MAXIMO}. Cada número pertence a um só piloto.`}
            erro={errors.numero?.message}
            {...register('numero', { setValueAs: numeroOuVazio })}
          />
          <CampoDeTexto
            rotulo="Títulos mundiais"
            type="number"
            inputMode="numeric"
            min={0}
            erro={errors.titulos?.message}
            {...register('titulos', { setValueAs: numeroOuVazio })}
          />
        </div>

        {errors.root && (
          <p className={styles.erro} role="alert">
            {errors.root.message}
          </p>
        )}

        <div className={styles.acoes}>
          <button type="submit" className={botao.primario} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : piloto ? 'Salvar alterações' : 'Cadastrar piloto'}
          </button>
          <Link to={voltarPara} className={botao.secundario}>
            Cancelar
          </Link>
        </div>
      </form>

      <aside className={styles.previa} aria-label="Prévia do cartão">
        <p className={styles.rotuloDaPrevia}>Prévia no grid</p>
        <CartaoDoPiloto
          nome={previa.nome ?? ''}
          numero={previa.numero}
          nacionalidade={previa.nacionalidade ?? ''}
          titulos={Number.isInteger(previa.titulos) ? (previa.titulos ?? 0) : 0}
          equipe={equipes.find((equipe) => equipe.id === previa.equipeId)?.nome ?? ''}
        />
      </aside>
    </div>
  );
}
