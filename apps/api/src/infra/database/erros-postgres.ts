interface ErroPostgres {
  code: string;
  constraint?: string;
}

const VIOLACAO_DE_UNICIDADE = '23505';
const VIOLACAO_DE_CHAVE_ESTRANGEIRA = '23503';

function encontrarErroPostgres(erro: unknown): ErroPostgres | null {
  let atual = erro;

  while (atual instanceof Error) {
    if ('code' in atual && typeof atual.code === 'string') {
      return atual as ErroPostgres;
    }

    atual = atual.cause;
  }

  return null;
}

export function violouUnicidade(erro: unknown, constraint: string) {
  const pg = encontrarErroPostgres(erro);

  return pg?.code === VIOLACAO_DE_UNICIDADE && pg.constraint === constraint;
}

export function violouChaveEstrangeira(erro: unknown, constraint: string) {
  const pg = encontrarErroPostgres(erro);

  return pg?.code === VIOLACAO_DE_CHAVE_ESTRANGEIRA && pg.constraint === constraint;
}
