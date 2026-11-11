import { type PainelDTO, painelSchema } from '@drs/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { MontarPainel, Painel } from '../../application/painel/montar-painel.js';

const CACHE_NO_NAVEGADOR_EM_S = 120;

function apresentarPainel({ campeonato, noticias }: Painel): PainelDTO {
  return {
    campeonato: campeonato && {
      ...campeonato,
      proximaCorrida: campeonato.proximaCorrida && {
        ...campeonato.proximaCorrida,
        inicio: campeonato.proximaCorrida.inicio.toISOString(),
        sessoes: campeonato.proximaCorrida.sessoes.map((sessao) => ({
          nome: sessao.nome,
          inicio: sessao.inicio.toISOString(),
        })),
      },
      ultimaCorrida: campeonato.ultimaCorrida && {
        ...campeonato.ultimaCorrida,
        data: campeonato.ultimaCorrida.data.toISOString(),
      },
    },
    noticias: noticias.map((noticia) => ({
      ...noticia,
      publicadaEm: noticia.publicadaEm.toISOString(),
    })),
  };
}

export const rotasPainel: FastifyPluginAsyncZod<{ montar: MontarPainel }> = async (
  app,
  { montar },
) => {
  app.get('/painel', { schema: { response: { 200: painelSchema } } }, async (_request, reply) => {
    reply.header('cache-control', `public, max-age=${CACHE_NO_NAVEGADOR_EM_S}`);

    return apresentarPainel(await montar.executar(new Date()));
  });
};
