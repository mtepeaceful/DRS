import type { FastifyInstance } from 'fastify';

const VERIFICAR_A_CADA_MS = 60 * 60_000;

export interface TarefaAgendada {
  descricao: string;
  primeiraEmMs: number;
  executar: () => Promise<Record<string, unknown> | null>;
}

export function agendarTarefas(app: FastifyInstance, tarefas: TarefaAgendada[]) {
  let relogios: NodeJS.Timeout[] = [];

  function rodar({ descricao, executar }: TarefaAgendada) {
    return async () => {
      try {
        const resultado = await executar();

        if (resultado) {
          app.log.info(resultado, descricao);
        }
      } catch (erro) {
        app.log.warn({ err: erro }, `Falhou: ${descricao}`);
      }
    };
  }

  app.addHook('onReady', async () => {
    relogios = tarefas.flatMap((tarefa) => [
      setTimeout(rodar(tarefa), tarefa.primeiraEmMs).unref(),
      setInterval(rodar(tarefa), VERIFICAR_A_CADA_MS).unref(),
    ]);
  });

  app.addHook('onClose', async () => {
    relogios.forEach(clearTimeout);
  });
}
