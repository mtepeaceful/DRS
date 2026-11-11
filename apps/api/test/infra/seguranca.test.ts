import { describe, expect, it } from 'vitest';
import { gerarHashDaSenha, senhaConfere } from '../../src/infra/seguranca/senha.js';

describe('hash da senha', () => {
  it('confere a senha certa e recusa a errada', async () => {
    const hash = await gerarHashDaSenha('uma-senha-bem-comprida');

    await expect(senhaConfere('uma-senha-bem-comprida', hash)).resolves.toBe(true);
    await expect(senhaConfere('uma-senha-bem-comprid', hash)).resolves.toBe(false);
  });

  it('gera hashes diferentes para a mesma senha', async () => {
    const [a, b] = await Promise.all([
      gerarHashDaSenha('uma-senha-bem-comprida'),
      gerarHashDaSenha('uma-senha-bem-comprida'),
    ]);

    expect(a).not.toBe(b);
  });

  it('recusa senha curta', async () => {
    await expect(gerarHashDaSenha('curta')).rejects.toThrow(/12 caracteres/);
  });

  it('não aceita um hash malformado', async () => {
    await expect(senhaConfere('qualquer', 'texto-puro')).resolves.toBe(false);
  });
});
