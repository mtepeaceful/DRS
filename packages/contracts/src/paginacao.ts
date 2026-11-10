import { z } from 'zod';

export function paginaSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    itens: z.array(item),
    total: z.number().int().min(0),
    pagina: z.number().int().min(1),
    porPagina: z.number().int().min(1),
  });
}
