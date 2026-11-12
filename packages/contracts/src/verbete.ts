import { z } from 'zod';

export const verbeteSchema = z.object({
  resumo: z.string(),
  fonte: z.url({ protocol: /^https$/ }),
  foto: z
    .object({
      url: z.url({ protocol: /^https$/, hostname: /^(thumb|upload)\.wikimedia\.org$/ }),
      pagina: z.url({ protocol: /^https$/, hostname: /^commons\.wikimedia\.org$/ }),
      autor: z.string().nullable(),
      licenca: z.string().nullable(),
    })
    .nullable(),
  fundacao: z.number().int().nullable(),
  fundadores: z.array(z.string()),
  sede: z.string().nullable(),
});

export type VerbeteDTO = z.infer<typeof verbeteSchema>;
