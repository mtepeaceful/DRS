import { setTimeout as esperar } from 'node:timers/promises';
import type { z } from 'zod';

const TEMPO_LIMITE_EM_MS = 15_000;
const TENTATIVAS_EXTRAS = 3;
const ESPERA_MAXIMA_EM_S = 10;
const STATUS_TEMPORARIOS = new Set([429, 502, 503, 504]);
const IDENTIFICACAO = 'DRS (github.com/mtepeaceful/DRS)';

export class FonteIndisponivel extends Error {
  constructor(url: string, causa: unknown) {
    super(`Não foi possível obter os dados de ${new URL(url).host}.`, { cause: causa });
    this.name = 'FonteIndisponivel';
  }
}

function esperaAntesDeTentarDeNovo(resposta: Response, tentativa: number) {
  const pedida = Number(resposta.headers.get('retry-after'));

  return Number.isFinite(pedida) && pedida > 0
    ? Math.min(pedida, ESPERA_MAXIMA_EM_S) * 1000
    : 1000 * 2 ** tentativa;
}

class NaoEncontrado extends Error {}

async function buscar(url: string, aceita: string) {
  for (let tentativa = 0; ; tentativa++) {
    const resposta = await fetch(url, {
      headers: { accept: aceita, 'user-agent': IDENTIFICACAO },
      signal: AbortSignal.timeout(TEMPO_LIMITE_EM_MS),
    });

    if (STATUS_TEMPORARIOS.has(resposta.status) && tentativa < TENTATIVAS_EXTRAS) {
      await esperar(esperaAntesDeTentarDeNovo(resposta, tentativa));
      continue;
    }

    if (resposta.status === 404) {
      throw new NaoEncontrado(`HTTP 404`);
    }

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta;
  }
}

export async function buscarJson<Schema extends z.ZodType>(url: string, schema: Schema) {
  try {
    const resposta = await buscar(url, 'application/json');

    return schema.parse(await resposta.json()) as z.output<Schema>;
  } catch (erro) {
    throw new FonteIndisponivel(url, erro);
  }
}

export async function buscarJsonSeExistir<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
): Promise<z.output<Schema> | null> {
  try {
    const resposta = await buscar(url, 'application/json');

    return schema.parse(await resposta.json()) as z.output<Schema>;
  } catch (erro) {
    if (erro instanceof NaoEncontrado) {
      return null;
    }

    throw new FonteIndisponivel(url, erro);
  }
}

export async function buscarTexto(url: string, aceita: string) {
  try {
    return await (await buscar(url, aceita)).text();
  } catch (erro) {
    throw new FonteIndisponivel(url, erro);
  }
}
