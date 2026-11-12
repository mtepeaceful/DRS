import type { FastifyInstance } from 'fastify';
import type { ManterGridAtualizado } from '../application/importacao/manter-grid-atualizado.js';

const PRIMEIRA_VERIFICACAO_EM_MS = 15_000;
const VERIFICAR_A_CADA_MS = 60 * 60_000;

export function agendarAtualizacaoDoGrid(app: FastifyInstance, manter: ManterGridAtualizado) {
  let relogios: NodeJS.Timeout[] = [];

  async function verificar() {
    try {
      const resultado = await manter.executarSeNecessario(new Date());

      if (resultado) {
        app.log.info(
          {
            ano: resultado.ano,
            pilotos: {
              criados: resultado.pilotos.criados,
              atualizados: resultado.pilotos.atualizados,
              ignorados: resultado.pilotos.ignorados.length,
            },
          },
          'Grid atualizado automaticamente',
        );
      }
    } catch (erro) {
      app.log.warn({ err: erro }, 'Não foi possível atualizar o grid automaticamente');
    }
  }

  app.addHook('onReady', async () => {
    relogios = [
      setTimeout(verificar, PRIMEIRA_VERIFICACAO_EM_MS).unref(),
      setInterval(verificar, VERIFICAR_A_CADA_MS).unref(),
    ];
  });

  app.addHook('onClose', async () => {
    relogios.forEach(clearTimeout);
  });
}
