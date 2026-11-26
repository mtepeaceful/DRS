import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CartaoDaEquipe, type EquipeDoCartao } from '../src/features/equipes/CartaoDaEquipe';

const mclaren: EquipeDoCartao = {
  id: 'mclaren',
  nome: 'McLaren',
  cores: { cor: '#ff8000', corSecundaria: '#000000' },
  pilotos: [
    { nome: 'Lando Norris', numero: 1 },
    { nome: 'Oscar Piastri', numero: 81 },
  ],
};

function renderizarCartao(equipe: EquipeDoCartao) {
  return render(
    <MemoryRouter>
      <CartaoDaEquipe equipe={equipe} />
    </MemoryRouter>,
  );
}

describe('Cartão da equipe', () => {
  it('mostra a equipe, os pilotos com o número e leva à ficha', () => {
    renderizarCartao(mclaren);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/equipes/mclaren');
    expect(screen.getByRole('heading', { level: 3, name: 'McLaren' })).toBeInTheDocument();
    expect(screen.getByText('Número 1')).toBeInTheDocument();
    expect(screen.getByText('NORRIS', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Piastri')).toBeInTheDocument();
  });

  it('acende ao passar o mouse ou focar e apaga ao sair', () => {
    const { container } = renderizarCartao(mclaren);
    const cartao = container.querySelector('article') as HTMLElement;

    expect(cartao).not.toHaveAttribute('data-acesa');

    fireEvent.pointerEnter(cartao);
    expect(cartao).toHaveAttribute('data-acesa', 'true');
    expect(container.querySelector('img[data-acesa]')).toBeInTheDocument();

    fireEvent.pointerLeave(cartao);
    expect(cartao).not.toHaveAttribute('data-acesa');

    fireEvent.focus(screen.getByRole('link'));
    expect(cartao).toHaveAttribute('data-acesa', 'true');
  });

  it('sem ficha no dicionário, o cartão não vira link', () => {
    renderizarCartao({ ...mclaren, id: null });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'McLaren' })).toBeInTheDocument();
  });
});
