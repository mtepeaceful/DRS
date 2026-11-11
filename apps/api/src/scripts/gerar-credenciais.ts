import { randomBytes } from 'node:crypto';
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

    const aoDigitar = (tecla: string) => {
      if (tecla === '\u0003') {
        stdout.write('\n');
        process.exit(130);
      }

      if (tecla === '\r' || tecla === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', aoDigitar);
        stdout.write('\n');
        resolver(resposta);
        return;
      }

      resposta = tecla === '\u007f' || tecla === '\b' ? resposta.slice(0, -1) : resposta + tecla;
    };

    stdin.on('data', aoDigitar);
  });
}

const senha = await perguntarSemEco(
  `Senha do administrador (mínimo ${TAMANHO_MINIMO_DA_SENHA} caracteres): `,
);
const confirmacao = await perguntarSemEco('Repita a senha: ');

if (senha !== confirmacao) {
  throw new Error('As senhas não conferem.');
}

stdout.write(
  [
    '',
    'Adicione estas linhas ao apps/api/.env (e às variáveis de ambiente do deploy):',
    '',
    `ADMIN_SENHA_HASH=${await gerarHashDaSenha(senha)}`,
    `SEGREDO_DA_SESSAO=${randomBytes(48).toString('base64url')}`,
    '',
  ].join('\n'),
);
