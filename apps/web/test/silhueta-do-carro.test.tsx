import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SilhuetaDoCarro } from '../src/features/equipes/SilhuetaDoCarro';

describe('Silhueta do carro', () => {
  it('é decorativa e leva as cores da equipe', () => {
    const { container } = render(<SilhuetaDoCarro cor="#ff8000" corSecundaria="#000000" />);
    const carro = container.querySelector('svg');

    expect(carro).toHaveAttribute('aria-hidden', 'true');
    expect(carro).not.toHaveAttribute('data-acesa');
    expect(carro?.style.getPropertyValue('--cor-carro')).toBe('#ff8000');
    expect(carro?.style.getPropertyValue('--cor-carro-secundaria')).toBe('#000000');
  });

  it('acende quando pedem', () => {
    const { container } = render(<SilhuetaDoCarro cor="#ff8000" corSecundaria="#000000" acesa />);

    expect(container.querySelector('svg')).toHaveAttribute('data-acesa', 'true');
  });
});
