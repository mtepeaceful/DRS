import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';

describe('Idioma do site', () => {
  it('troca o site para inglês e volta para português', async () => {
    const { usuario } = renderizar('/calendario');
    const navegacao = await screen.findByRole('navigation', { name: 'Principal' });

    expect(within(navegacao).getByRole('link', { name: 'Calendário' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR');

    await usuario.click(screen.getByRole('button', { name: 'Read in English' }));

    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Calendar' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Drivers' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(window.localStorage.getItem('drs-idioma')).toBe('en');

    await usuario.click(screen.getByRole('button', { name: 'Ler em português' }));

    expect(await screen.findByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR');
  });

  it('traduz a página aberta, não só o cabeçalho', async () => {
    const { usuario } = renderizar('/rota-que-nao-existe');

    expect(
      await screen.findByRole('heading', { name: 'Essa página saiu da pista' }),
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Read in English' }));

    expect(
      await screen.findByRole('heading', { name: 'This page went off track' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument();
  });
});

describe('Conteúdo do dicionário em inglês', () => {
  it('traduz os termos do glossário e mantém os links entre eles', async () => {
    const { usuario } = renderizar('/glossario');

    await usuario.click(await screen.findByRole('button', { name: 'Read in English' }));

    expect(await screen.findByRole('heading', { name: 'F1 glossary' })).toBeInTheDocument();
    expect(screen.getByText('Free practice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Flags and safety' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Qualifying' }).length).toBeGreaterThan(0);
  });

  it('traduz as eras dos carros', async () => {
    const { usuario } = renderizar('/historia/carros');

    await usuario.click(await screen.findByRole('button', { name: 'Read in English' }));

    expect(
      await screen.findByRole('heading', { name: 'How the cars evolved' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The turbo era' })).toBeInTheDocument();
  });
});
