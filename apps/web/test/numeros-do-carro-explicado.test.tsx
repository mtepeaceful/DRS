import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// O 3D não roda no jsdom: a cena nunca começa e só os botões são testados.
vi.mock('../src/features/garagem/suporte', () => ({
  quandoO3dPuderComecar: () => new Promise(() => {}),
}));

const { Carro3DExplicado } = await import('../src/features/carro-explicado/Carro3DExplicado');

describe('Números das peças no carro 3D', () => {
  it('somem e voltam pelo botão', () => {
    render(<Carro3DExplicado selecionada={null} aoSelecionar={() => {}} />);
    const marcador = screen.getByRole('button', { name: 'Asa dianteira' });
    const alternar = screen.getByRole('button', { name: 'Ocultar números' });

    expect(marcador).toBeVisible();

    fireEvent.click(alternar);
    expect(marcador).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Mostrar números', hidden: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar números' }));
    expect(marcador).toBeVisible();
  });
});
