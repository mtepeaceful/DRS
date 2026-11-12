import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { banco } from './servidor';

function idDoLeclerc() {
  banco.reiniciar();

  return banco.pilotos.find((piloto) => piloto.nome === 'Charles Leclerc')?.id;
}

describe('Garagem 3D', () => {
  it('abre a partir da página do piloto', async () => {
    const id = idDoLeclerc();
    const { usuario, router } = renderizar(`/pilotos/${id}`);

    await usuario.click(await screen.findByRole('link', { name: 'Ver o carro em 3D →' }));

    expect(await screen.findByText('Garagem 3D')).toBeVisible();
    expect(router.state.location.pathname).toBe(`/pilotos/${id}/garagem`);
  });

  it('mostra o carro de lado quando o navegador não tem 3D e deixa abrir o DRS', async () => {
    const { usuario } = renderizar(`/pilotos/${idDoLeclerc()}/garagem`);

    const carro = await screen.findByRole('img', { name: 'Carro número 16 visto de lado' });
    const drs = screen.getByRole('button', { name: 'DRS fechado' });

    expect(carro).toBeVisible();
    expect(screen.getByText(/não consegue mostrar 3D/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver em 3D' })).not.toBeInTheDocument();

    await usuario.click(drs);

    expect(screen.getByRole('button', { name: 'DRS aberto' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('avisa quando o piloto não existe', async () => {
    renderizar(`/pilotos/${crypto.randomUUID()}/garagem`);

    expect(await screen.findByRole('heading', { name: 'Piloto não encontrado' })).toBeVisible();
  });
});
