import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SilhuetaDoCarro } from '../src/features/equipes/SilhuetaDoCarro';

describe('Silhueta do carro', () => {
  it('mostra o carro da equipe de lado', () => {
    const { container } = render(<SilhuetaDoCarro nome="McLaren" />);
    const carro = container.querySelector('img');

    expect(carro).toHaveAttribute('src', '/modelos/mcl40/lado.webp');
    expect(carro).toHaveAttribute('alt', '');
    expect(carro).toHaveAttribute('loading', 'lazy');
    expect(carro).not.toHaveAttribute('data-acesa');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('dá o carro de reserva a uma equipe sem carro, nunca o desenho antigo', () => {
    const { container } = render(<SilhuetaDoCarro nome="Equipe Nova" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/modelos/fw48/lado.webp');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('acende quando pedem', () => {
    const { container } = render(<SilhuetaDoCarro nome="Ferrari" acesa />);

    expect(container.querySelector('img')).toHaveAttribute('data-acesa', 'true');
  });
});
