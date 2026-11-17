import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CAPITULOS } from '../src/features/historia-do-drs/capitulos';
import { TERMOS } from '../src/features/glossario/termos';
import { renderizar } from './renderizar';

describe('Capítulos da história do DRS', () => {
  it('tem ids únicos e só cita termos do glossário', () => {
    const termos = new Set(TERMOS.map((termo) => termo.id));

    expect(new Set(CAPITULOS.map((capitulo) => capitulo.id)).size).toBe(CAPITULOS.length);
    for (const capitulo of CAPITULOS) {
      for (const termo of capitulo.termos) {
        expect(termos, `${capitulo.id} → ${termo}`).toContain(termo);
      }
    }
  });
});

describe('A história do DRS', () => {
  it('conta a história de 2009 a 2026 com atalhos e termos do glossário', async () => {
    renderizar('/historia/drs');

    expect(
      await screen.findByRole('heading', { name: 'A história do DRS', level: 1 }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Capítulos' }))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(CAPITULOS.map((capitulo) => `#${capitulo.id}`));

    const fDuct = screen.getByRole('heading', { name: 'O truque da McLaren: o F-duct' });
    expect(fDuct.closest('li')).toHaveAttribute('id', 'f-duct');
    const nasce = screen.getByRole('heading', { name: 'Nasce o DRS' }).closest('li');
    expect(nasce).toHaveAttribute('id', 'nasce-o-drs');
    expect(within(nasce as HTMLElement).getByRole('link', { name: 'DRS' })).toHaveAttribute(
      'href',
      '/glossario#drs',
    );
  });

  it('abre a asa só a menos de um segundo do carro da frente', async () => {
    renderizar('/historia/drs');

    const zona = within(await screen.findByRole('region', { name: 'Teste a regra' }));
    const regua = zona.getByRole('slider', {
      name: 'Diferença para o carro da frente no ponto de detecção',
    });
    expect(zona.getByRole('status')).toHaveTextContent('Longe demais');

    fireEvent.change(regua, { target: { value: '0.8' } });
    expect(zona.getByRole('status')).toHaveTextContent('DRS liberado');
    expect(regua).toHaveAttribute('aria-valuetext', '0,8 segundos');

    fireEvent.change(regua, { target: { value: '1' } });
    expect(zona.getByRole('status')).toHaveTextContent('DRS liberado');
    expect(regua).toHaveAttribute('aria-valuetext', '1,0 segundo');
  });
});
