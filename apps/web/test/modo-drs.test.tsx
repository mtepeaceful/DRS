import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';

async function zonaDrs() {
  const cabecalho = await screen.findByRole('banner');
  const zona = cabecalho.querySelector(':scope > span[aria-hidden="true"]');
  if (!zona) throw new Error('Linha do Modo DRS não encontrada');
  return zona;
}

describe('Modo DRS', () => {
  it('acende a linha do topo enquanto a asa está aberta e apaga quando os dados chegam', async () => {
    renderizar('/pilotos');

    await expect.poll(async () => (await zonaDrs()).hasAttribute('data-aberta')).toBe(true);

    await screen.findByRole('heading', { level: 1 });
    await expect.poll(async () => (await zonaDrs()).hasAttribute('data-aberta')).toBe(false);
  });

  it('fica fora da árvore de acessibilidade', async () => {
    renderizar('/');
    expect(await zonaDrs()).toHaveAttribute('aria-hidden', 'true');
  });
});
