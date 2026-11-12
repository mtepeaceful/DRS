import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ERAS } from '../src/features/carros/eras';
import { TERMOS } from '../src/features/glossario/termos';
import { renderizar } from './renderizar';

describe('Eras dos carros', () => {
  it('tem ids únicos, marcos em ordem e só cita termos do glossário', () => {
    const termos = new Set(TERMOS.map((termo) => termo.id));

    expect(new Set(ERAS.map((era) => era.id)).size).toBe(ERAS.length);
    for (const era of ERAS) {
      expect(era.marcos.map((marco) => marco.ano)).toEqual(
        era.marcos.map((marco) => marco.ano).toSorted((a, b) => a - b),
      );
      for (const termo of era.termos) {
        expect(termos, `${era.id} → ${termo}`).toContain(termo);
      }
    }
  });
});

describe('História dos carros', () => {
  it('mostra as eras com atalhos, temporadas e termos do glossário', async () => {
    renderizar('/historia/carros#turbo');

    const turbo = await screen.findByRole('heading', { name: 'A era turbo', level: 2 });
    const era = turbo.closest('li');

    expect(era).toHaveAttribute('id', 'turbo');
    await expect.poll(() => document.activeElement?.id).toBe('turbo');
    expect(screen.getByRole('link', { name: /1977–1988\s*A era turbo/ })).toHaveAttribute(
      'href',
      '#turbo',
    );
    expect(screen.getByRole('link', { name: '1988' })).toHaveAttribute('href', '/historia/1988');

    const ultima = screen.getByRole('heading', { name: 'Aerodinâmica ativa', level: 2 });
    const dentro = within(ultima.parentElement ?? document.body);
    expect(dentro.getByRole('link', { name: 'DRS' })).toHaveAttribute('href', '/glossario#drs');
  });
});
