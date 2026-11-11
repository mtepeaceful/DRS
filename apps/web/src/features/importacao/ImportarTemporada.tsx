import { resultadoDaImportacaoSchema } from '@drs/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buscar, mensagemDoErro } from '../../shared/api/http';
import botao from '../../shared/ui/botao.module.css';
import styles from './ImportarTemporada.module.css';

export function ImportarTemporada() {
  const queryClient = useQueryClient();
  const importar = useMutation({
    mutationFn: () =>
      buscar('/importacoes/temporada-atual', resultadoDaImportacaoSchema, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const resultado = importar.data;

  return (
    <div className={styles.painel}>
      <button
        type="button"
        className={botao.secundario}
        onClick={() => importar.mutate()}
        disabled={importar.isPending}
      >
        {importar.isPending ? 'Importando… pode levar até 30 segundos' : 'Importar temporada atual'}
      </button>

      <div aria-live="polite">
        {importar.isError && (
          <p className={styles.erro} role="alert">
            {mensagemDoErro(importar.error)}
          </p>
        )}

        {resultado && (
          <div className={styles.resumo}>
            <p>
              Temporada {resultado.ano}: {resultado.pilotos.criados} pilotos novos,{' '}
              {resultado.pilotos.atualizados} atualizados, {resultado.equipes.criadas} equipes novas
              e {resultado.equipes.atualizadas} atualizadas.
            </p>
            {resultado.pilotos.ignorados.length > 0 && (
              <ul className={styles.ignorados}>
                {resultado.pilotos.ignorados.map(({ nome, motivo }) => (
                  <li key={nome}>
                    {nome}: {motivo}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
