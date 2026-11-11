import { type ErroDTO, erroSchema } from '@drs/contracts';
import type { z } from 'zod';
import { encerrarSessao, tokenDaSessao } from './sessao';

const BASE: string = import.meta.env.VITE_API_URL ?? '/api';

export class ErroDaApi extends Error {
  constructor(
    readonly status: number,
    readonly erro: ErroDTO,
  ) {
    super(erro.mensagem);
    this.name = 'ErroDaApi';
  }
}

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

async function requisitar(caminho: string, { method = 'GET', body, signal }: Opcoes) {
  const init: RequestInit = { method };

  if (signal) {
    init.signal = signal;
  }

  const headers: Record<string, string> = {};
  const token = tokenDaSessao();

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  init.headers = headers;

  let resposta: Response;

  try {
    resposta = await fetch(`${BASE}${caminho}`, init);
  } catch (causa) {
    if (causa instanceof DOMException && causa.name === 'AbortError') {
      throw causa;
    }

    throw new ErroDaApi(0, {
      codigo: 'SEM_CONEXAO',
      mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.',
    });
  }

  if (resposta.status === 401 && token) {
    encerrarSessao();
  }

  if (!resposta.ok) {
    const erro = erroSchema.safeParse(await resposta.json().catch(() => null));

    throw new ErroDaApi(
      resposta.status,
      erro.success
        ? erro.data
        : { codigo: 'ERRO_INESPERADO', mensagem: 'O servidor respondeu com um erro inesperado.' },
    );
  }

  return resposta;
}

export async function buscar<Schema extends z.ZodType>(
  caminho: string,
  schema: Schema,
  opcoes: Opcoes = {},
): Promise<z.output<Schema>> {
  const resposta = await requisitar(caminho, opcoes);

  return schema.parse(await resposta.json());
}

export async function enviar(caminho: string, opcoes: Opcoes): Promise<void> {
  await requisitar(caminho, opcoes);
}

export function mensagemDoErro(erro: unknown) {
  return erro instanceof ErroDaApi ? erro.message : 'Algo deu errado. Tente de novo.';
}
