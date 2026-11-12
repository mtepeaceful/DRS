import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

describe('Classificação do campeonato', () => {
  it('lista todos os pilotos e construtores com vitórias e pontos', async () => {
    servidor.use(
      http.get('*/api/painel', () =>
        HttpResponse.json({
          campeonato: {
            ano: 2026,
            totalDeRodadas: 23,
            rodadasDisputadas: 20,
            proximaCorrida: null,
            ultimaCorrida: null,
            pilotos: Array.from({ length: 12 }, (_, i) => ({
              posicao: i + 1,
              nome: `Piloto ${i + 1}`,
              equipe: 'RB F1 Team',
              pontos: 300 - i * 10,
              vitorias: i === 0 ? 9 : 0,
            })),
            construtores: [{ posicao: 1, nome: 'Mercedes', pontos: 652, vitorias: 12 }],
          },
          noticias: [],
        }),
      ),
    );
    renderizar('/classificacao');

    const pilotos = await screen.findByRole('region', { name: 'Pilotos' });

    expect(screen.getByText(/Depois de 20 de 23 etapas/)).toBeInTheDocument();
    expect(within(pilotos).getAllByRole('row')).toHaveLength(13);
    expect(within(pilotos).getByRole('row', { name: /Piloto 12/ })).toHaveTextContent(
      'Racing Bulls',
    );
    expect(
      within(screen.getByRole('region', { name: 'Construtores' })).getByRole('row', {
        name: /Mercedes/,
      }),
    ).toHaveTextContent('12652');
  });
});
