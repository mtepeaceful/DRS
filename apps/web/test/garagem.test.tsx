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

  it('mostra a foto do carro novo de lado quando o navegador não tem 3D', async () => {
    renderizar(`/pilotos/${idDoLeclerc()}/garagem`);

    const carro = await screen.findByRole('img', { name: 'Carro número 16 visto de lado' });

    expect(carro).toBeVisible();
    expect(carro).toHaveAttribute('src', '/modelos/sf26/lado.webp');
    expect(screen.getByText(/não consegue mostrar 3D/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /DRS/ })).not.toBeInTheDocument();
  });

  it('avisa quando o piloto não existe', async () => {
    renderizar(`/pilotos/${crypto.randomUUID()}/garagem`);

    expect(await screen.findByRole('heading', { name: 'Piloto não encontrado' })).toBeVisible();
  });
});
