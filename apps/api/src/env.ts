import { z } from 'zod';
import { hashValido } from './infra/seguranca/senha.js';

const base = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ORIGENS_PERMITIDAS: z
    .string()
    .default('')
    .transform((lista) =>
      lista
        .split(',')
        .map((origem) => origem.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.url({ protocol: /^https?$/ }))),
  ADMIN_SENHA_HASH: z.string().refine(hashValido, {
    error: 'Gere com "pnpm --filter @drs/api gerar-credenciais".',
  }),
  SEGREDO_DA_SESSAO: z.string().min(32, { error: 'Use um segredo com pelo menos 32 caracteres.' }),
  ATUALIZAR_GRID_SOZINHO: z.stringbool().default(true),
});

const armazenamento = z.discriminatedUnion('ARMAZENAMENTO', [
  z.object({
    ARMAZENAMENTO: z.literal('postgres'),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  }),
  z.object({
    ARMAZENAMENTO: z.literal('memoria'),
  }),
]);

const envSchema = z.intersection(
  base,
  z.preprocess((valor) => ({ ARMAZENAMENTO: 'postgres', ...(valor as object) }), armazenamento),
);

export type Env = z.infer<typeof envSchema>;
export type ConfiguracaoDeArmazenamento = z.infer<typeof armazenamento>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}
