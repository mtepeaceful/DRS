import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CATEGORIAS, TERMOS } from '../src/features/glossario/termos';
import { renderizar } from './renderizar';

describe('Termos do glossário', () => {
  it('tem ids únicos e só relaciona termos que existem', () => {
    const ids = new Set(TERMOS.map((termo) => termo.id));

    expect(ids.size).toBe(TERMOS.length);
    for (const termo of TERMOS) {
      expect(termo.id).toMatch(/^[a-z0-9-]+$/);
      expect(Object.keys(CATEGORIAS)).toContain(termo.categoria);
      for (const relacionado of termo.relacionados) {
        expect(ids, `${termo.id} → ${relacionado}`).toContain(relacionado);
        expect(relacionado).not.toBe(termo.id);
      }
    }
  });
});

describe('Glossário', () => {
  it('busca sem acento e filtra por categoria', async () => {
    const { usuario } = renderizar('/glossario');

    const busca = await screen.findByRole('searchbox', { name: 'Buscar termo' });
    expect(screen.getByText(`${TERMOS.length} termos`)).toBeInTheDocument();

    await usuario.type(busca, 'parc ferme');
    expect(await screen.findByText('2 termos')).toBeInTheDocument();
    expect(screen.getAllByRole('term').map((termo) => termo.firstChild?.textContent)).toEqual([
      'Largada do pit lane',
      'Parc fermé',
    ]);

    await usuario.clear(busca);
    await usuario.click(screen.getByRole('button', { name: 'Bandeiras e segurança' }));

    const bandeiras = TERMOS.filter((termo) => termo.categoria === 'bandeiras').length;
    expect(await screen.findByText(`${bandeiras} termos`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bandeiras e segurança' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('abre direto no termo da âncora com os relacionados e o atalho do site', async () => {
    renderizar('/glossario#undercut');

    expect(await screen.findByText('Undercut', { selector: 'dt' })).toBeInTheDocument();
    await expect.poll(() => document.activeElement?.id).toBe('undercut');
    expect(screen.getAllByRole('link', { name: 'Overcut' })[0]).toHaveAttribute('href', '#overcut');
  });
});
