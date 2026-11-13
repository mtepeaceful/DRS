import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';

describe('Menu do dicionário', () => {
  it('mostra os atalhos na lateral e destaca a página atual', async () => {
    renderizar('/glossario');

    const lateral = within(await screen.findByRole('complementary'));
    expect(lateral.getByRole('link', { name: 'Glossário' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(lateral.getByRole('link', { name: 'O carro por dentro' })).toHaveAttribute(
      'href',
      '/carro',
    );
  });

  it('abre pelo botão do cabeçalho e fecha ao trocar de página', async () => {
    const { router, usuario } = renderizar('/glossario');

    const botao = await screen.findByRole('button', { name: 'Dicionário' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');

    await usuario.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');

    const painel = document.getElementById(botao.getAttribute('aria-controls') ?? '');
    await usuario.click(within(painel ?? document.body).getByRole('link', { name: 'Circuitos' }));

    await expect
      .poll(
        () => screen.getByRole('button', { name: 'Dicionário' }).getAttribute('aria-expanded'),
        { timeout: 5000 },
      )
      .toBe('false');
    expect(router.state.location.pathname).toBe('/circuitos');
  });
});
