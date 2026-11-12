import { z } from 'zod';

export const fotoSchema = z.object({
  url: z.url({ protocol: /^https$/, hostname: /^(thumb|upload)\.wikimedia\.org$/ }),
  pagina: z.url({ protocol: /^https$/, hostname: /^commons\.wikimedia\.org$/ }),
  autor: z.string().nullable(),
  licenca: z.string().nullable(),
});

export const verbeteSchema = z.object({
  resumo: z.string(),
  fonte: z.url({ protocol: /^https$/ }),
  foto: fotoSchema.nullable(),
  fundacao: z.number().int().nullable(),
  fundadores: z.array(z.string()),
  sede: z.string().nullable(),
});

export type VerbeteDTO = z.infer<typeof verbeteSchema>;
export type FotoDTO = z.infer<typeof fotoSchema>;
