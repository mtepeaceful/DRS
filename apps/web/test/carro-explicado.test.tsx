import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PECAS } from '../src/features/carro-explicado/pecas';
import { TERMOS } from '../src/features/glossario/termos';
import { renderizar } from './renderizar';

describe('Peças do carro', () => {
  it('tem ids únicos e só cita termos do glossário', () => {
    const termos = new Set(TERMOS.map((termo) => termo.id));

    expect(new Set(PECAS.map((peca) => peca.id)).size).toBe(PECAS.length);
    for (const peca of PECAS) {
      for (const termo of peca.termos) {
        expect(termos, `${peca.id} → ${termo}`).toContain(termo);
      }
    }
  });
});

describe('Carro explicado', () => {
  it('explica a peça escolhida na lista e guarda a escolha no endereço', async () => {
    const { router, usuario } = renderizar('/carro');

    const lista = await screen.findByRole('list', { name: 'Peças do carro' });
    await usuario.click(within(lista).getByRole('button', { name: /Halo/ }));

    const explicacao = screen.getByRole('region', { name: 'Explicação da peça' });
    expect(within(explicacao).getByRole('heading', { name: 'Halo' })).toBeVisible();
    expect(within(explicacao).getByRole('link', { name: 'Halo' })).toHaveAttribute(
      'href',
      '/glossario#halo',
    );
    expect(router.state.location.search).toBe('?peca=halo');

    await usuario.click(within(lista).getByRole('button', { name: /Halo/ }));
    expect(router.state.location.search).toBe('');
  });

  it('abre direto na peça do endereço e avisa quando não há 3D', async () => {
    renderizar('/carro?peca=asa-traseira');

    expect(await screen.findByRole('heading', { name: 'Asa traseira' })).toBeVisible();
    expect(screen.getByText(/não consegue mostrar 3D/)).toBeInTheDocument();
  });
});
