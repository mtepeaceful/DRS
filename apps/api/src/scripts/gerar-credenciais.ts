import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { gerarHashDaSenha, TAMANHO_MINIMO_DA_SENHA } from '../infra/seguranca/senha.js';

function perguntarSemEco(pergunta: string) {
  return new Promise<string>((resolver, rejeitar) => {
    if (!stdin.isTTY) {
      rejeitar(new Error('Rode este comando num terminal interativo.'));
      return;
    }

    let resposta = '';
    stdout.write(pergunta);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const aoDigitar = (trecho: string) => {
      for (const caractere of trecho) {
        if (caractere === '\u0003') {
          stdout.write('\n');
          process.exit(130);
        }

        if (caractere === '\r' || caractere === '\n') {
          if (resposta === '') {
            continue;
          }

          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', aoDigitar);
          stdout.write('\n');
          resolver(resposta);
          return;
        }

        if (caractere === '\u007f' || caractere === '\b') {
          resposta = resposta.slice(0, -1);
        } else if (caractere >= ' ') {
          resposta += caractere;
        }
      }
    };

    stdin.on('data', aoDigitar);
  });
}

async function lerSenha() {
  const indice = process.argv.indexOf('--arquivo');

  if (indice === -1) {
    const senha = await perguntarSemEco(
      `Senha do administrador (mínimo ${TAMANHO_MINIMO_DA_SENHA} caracteres): `,
    );

    if (senha !== (await perguntarSemEco('Repita a senha: '))) {
      throw new Error('As senhas não conferem.');
    }

    return senha;
  }

  const caminho = process.argv[indice + 1];

  if (!caminho) {
    throw new Error('Informe o caminho do arquivo depois de --arquivo.');
  }

  const senha = readFileSync(caminho, 'utf8')
    .replace(/^\uFEFF/, '')
    .replace(/\r?\n$/, '');
  rmSync(caminho);
  stdout.write(`Senha lida e arquivo ${caminho} apagado.\n`);

  return senha;
}

function gravarNoEnv(variaveis: Record<string, string>) {
  const caminho = resolve('.env');
  const linhas = existsSync(caminho) ? readFileSync(caminho, 'utf8').split(/\r?\n/) : [];

  for (const [chave, valor] of Object.entries(variaveis)) {
    const linha = `${chave}=${valor}`;
    const indice = linhas.findIndex((atual) => atual.startsWith(`${chave}=`));

    if (indice === -1) {
      linhas.splice(linhas.at(-1) === '' ? -1 : linhas.length, 0, linha);
    } else {
      linhas[indice] = linha;
    }
  }

  writeFileSync(caminho, `${linhas.join('\n').replace(/\n*$/, '')}\n`);

  return caminho;
}

const hash = await gerarHashDaSenha(await lerSenha());
const env = gravarNoEnv({
  ADMIN_SENHA_HASH: hash,
  SEGREDO_DA_SESSAO: randomBytes(48).toString('base64url'),
});

stdout.write(
  [
    '',
    `Credenciais gravadas em ${env}.`,
    '',
    'Para o Render, use este valor em ADMIN_SENHA_HASH:',
    '',
    hash,
    '',
  ].join('\n'),
);
