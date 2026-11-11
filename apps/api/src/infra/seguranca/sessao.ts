import { createHmac, timingSafeEqual } from 'node:crypto';

export const DURACAO_DA_SESSAO_EM_MS = 8 * 60 * 60 * 1000;

function assinar(conteudo: string, segredo: string) {
  return createHmac('sha256', segredo).update(conteudo).digest('base64url');
}

export function emitirToken(segredo: string, agora = Date.now()) {
  const expiraEm = agora + DURACAO_DA_SESSAO_EM_MS;
  const conteudo = Buffer.from(JSON.stringify({ exp: expiraEm })).toString('base64url');

  return { token: `${conteudo}.${assinar(conteudo, segredo)}`, expiraEm: new Date(expiraEm) };
}

export function tokenValido(token: string, segredo: string, agora = Date.now()) {
  const [conteudo, assinatura, ...resto] = token.split('.');

  if (!conteudo || !assinatura || resto.length > 0) {
    return false;
  }

  const recebida = Buffer.from(assinatura, 'base64url');
  const esperada = Buffer.from(assinar(conteudo, segredo), 'base64url');

  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(conteudo, 'base64url').toString()) as { exp: unknown };

    return typeof exp === 'number' && exp > agora;
  } catch {
    return false;
  }
}
