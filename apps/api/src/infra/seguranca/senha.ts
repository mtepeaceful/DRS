import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const CUSTO = 2 ** 15;
const BLOCOS = 8;
const PARALELISMO = 1;
const TAMANHO_DA_CHAVE = 64;
const MEMORIA_MAXIMA = 64 * 1024 * 1024;

export const TAMANHO_MINIMO_DA_SENHA = 12;

function derivar(senha: string, sal: Buffer, custo: number, blocos: number, paralelismo: number) {
  return new Promise<Buffer>((resolver, rejeitar) => {
    scrypt(
      senha.normalize('NFKC'),
      sal,
      TAMANHO_DA_CHAVE,
      { N: custo, r: blocos, p: paralelismo, maxmem: MEMORIA_MAXIMA },
      (erro, chave) => (erro ? rejeitar(erro) : resolver(chave)),
    );
  });
}

export async function gerarHashDaSenha(senha: string) {
  if (senha.length < TAMANHO_MINIMO_DA_SENHA) {
    throw new Error(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres.`);
  }

  const sal = randomBytes(16);
  const chave = await derivar(senha, sal, CUSTO, BLOCOS, PARALELISMO);

  return [
    'scrypt',
    CUSTO,
    BLOCOS,
    PARALELISMO,
    sal.toString('base64url'),
    chave.toString('base64url'),
  ].join('$');
}

export function hashValido(hash: string) {
  const partes = hash.split('$');

  return (
    partes.length === 6 &&
    partes[0] === 'scrypt' &&
    partes.slice(1, 4).every((n) => /^\d+$/.test(n))
  );
}

export async function senhaConfere(senha: string, hash: string) {
  if (!hashValido(hash)) {
    return false;
  }

  const [, custo, blocos, paralelismo, sal, esperado] = hash.split('$') as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const chaveEsperada = Buffer.from(esperado, 'base64url');
  const chave = await derivar(
    senha,
    Buffer.from(sal, 'base64url'),
    Number(custo),
    Number(blocos),
    Number(paralelismo),
  );

  return chave.length === chaveEsperada.length && timingSafeEqual(chave, chaveEsperada);
}
