import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { SENHA_CORRETA } from './servidor';

describe('Entrar como administrador', () => {
  it('pede a senha antes de enviar', async () => {
    const { usuario } = renderizar('/entrar');

    await usuario.click(await screen.findByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Informe a senha.');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true');
  });

  it('avisa quando a senha está errada e mantém a pessoa na página', async () => {
    const { router, usuario } = renderizar('/entrar');

    await usuario.type(await screen.findByLabelText('Senha'), 'chute-qualquer');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta.');
    expect(screen.getByLabelText('Senha')).toHaveFocus();
    expect(router.state.location.pathname).toBe('/entrar');
  });

  it('entra e volta para a página que a pessoa queria', async () => {
    const { router, usuario } = renderizar('/entrar?voltar=%2Fpilotos%2Fnovo');

    await usuario.type(await screen.findByLabelText('Senha'), SENHA_CORRETA);
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Novo piloto' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pilotos/novo');
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('ignora destinos de fora do site', async () => {
    const { router, usuario } = renderizar('/entrar?voltar=%2F%2Fsite-malicioso.com');

    await usuario.type(await screen.findByLabelText('Senha'), SENHA_CORRETA);
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    await screen.findByRole('button', { name: 'Sair' });
    expect(router.state.location.pathname).toBe('/');
  });

  it('sai e esconde as ações de administrador', async () => {
    const { usuario } = renderizar('/pilotos', { logado: true });

    await usuario.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Novo piloto/ })).not.toBeInTheDocument();
  });
});

describe('Páginas restritas', () => {
  it('manda quem não entrou para o login, lembrando de onde veio', async () => {
    const { router } = renderizar('/pilotos/novo');

    expect(
      await screen.findByRole('heading', { name: 'Área do administrador' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/entrar');
    expect(router.state.location.search).toBe('?voltar=%2Fpilotos%2Fnovo');
  });
});
