import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SilhuetaDoCarro } from '../src/features/equipes/SilhuetaDoCarro';

describe('Silhueta do carro', () => {
  it('mostra o carro do Sketchfab de lado quando a equipe tem um', () => {
    const { container } = render(
      <SilhuetaDoCarro nome="McLaren" numero={81} cor="#ff8000" corSecundaria="#000000" />,
    );
    const carro = container.querySelector('img');

    expect(carro).toHaveAttribute('src', '/modelos/mcl40/lado.webp');
    expect(carro).toHaveAttribute('alt', '');
    expect(carro).toHaveAttribute('loading', 'lazy');
    expect(carro).not.toHaveAttribute('data-acesa');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('desenha em SVG, com a pintura e o número, a equipe sem modelo', () => {
    const { container } = render(
      <SilhuetaDoCarro nome="Alpine" numero={10} cor="#ff87bc" corSecundaria="#0093cc" />,
    );
    const carro = container.querySelector('svg');

    expect(carro).toHaveAttribute('aria-hidden', 'true');
    expect(carro).not.toHaveAttribute('data-acesa');
    expect(
      [...container.querySelectorAll('text')].filter((t) => t.textContent === '10'),
    ).toHaveLength(2);
  });

  it('usa as cores da equipe quando ela não tem pintura própria', () => {
    const { container } = render(
      <SilhuetaDoCarro nome="Equipe Nova" cor="#123456" corSecundaria="#abcdef" />,
    );

    expect(container.querySelector('path[fill="#123456"]')).not.toBeNull();
    expect(container.querySelector('path[fill="#abcdef"]')).not.toBeNull();
  });

  it('não repete ids quando há vários carros na página', () => {
    const { container } = render(
      <>
        <SilhuetaDoCarro nome="Alpine" cor="#ff87bc" corSecundaria="#0093cc" />
        <SilhuetaDoCarro nome="Alpine" cor="#ff87bc" corSecundaria="#0093cc" />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((elemento) => elemento.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('acende quando pedem', () => {
    const { container } = render(
      <>
        <SilhuetaDoCarro nome="Ferrari" cor="#dc0000" corSecundaria="#fff200" acesa />
        <SilhuetaDoCarro nome="Alpine" cor="#ff87bc" corSecundaria="#0093cc" acesa />
      </>,
    );

    expect(container.querySelector('img')).toHaveAttribute('data-acesa', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('data-acesa', 'true');
  });
});
