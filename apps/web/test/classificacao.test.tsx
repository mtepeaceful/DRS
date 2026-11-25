import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { banco, servidor } from './servidor';

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

  it('liga piloto e equipe ao perfil só quando o perfil existe', async () => {
    servidor.use(
      http.get('*/api/painel', () =>
        HttpResponse.json({
          campeonato: {
            ano: 2026,
            totalDeRodadas: 23,
            rodadasDisputadas: 20,
            proximaCorrida: null,
            ultimaCorrida: null,
            pilotos: [
              { posicao: 1, nome: 'Lando Norris', equipe: 'McLaren', pontos: 400, vitorias: 8 },
              { posicao: 2, nome: 'Nico Hülkenberg', equipe: 'Sauber', pontos: 40, vitorias: 0 },
              { posicao: 3, nome: 'Piloto Novato', equipe: 'Sauber', pontos: 0, vitorias: 0 },
            ],
            construtores: [
              { posicao: 1, nome: 'McLaren', pontos: 700, vitorias: 12 },
              { posicao: 2, nome: 'Equipe Nova', pontos: 0, vitorias: 0 },
            ],
          },
          noticias: [],
        }),
      ),
      http.get('*/api/historia/pilotos', () =>
        HttpResponse.json([
          {
            id: 'hulkenberg',
            nome: 'Nico Hulkenberg',
            pais: 'DE',
            nascimento: '1987-08-19',
            wikipedia: null,
            titulos: 0,
          },
        ]),
      ),
      http.get('*/api/historia/equipes', () =>
        HttpResponse.json([
          {
            id: 'mclaren',
            nome: 'McLaren',
            pais: 'GB',
            wikipedia: null,
            titulosDeConstrutores: 10,
            titulosDePilotos: 13,
            noGridAtual: true,
          },
        ]),
      ),
    );
    renderizar('/classificacao');

    const pilotos = await screen.findByRole('region', { name: 'Pilotos' });
    const construtores = screen.getByRole('region', { name: 'Construtores' });

    expect(await within(pilotos).findByRole('link', { name: 'Lando Norris' })).toHaveAttribute(
      'href',
      `/pilotos/${banco.pilotos[2]?.id}`,
    );
    expect(await within(pilotos).findByRole('link', { name: 'Nico Hülkenberg' })).toHaveAttribute(
      'href',
      '/historia/pilotos/hulkenberg',
    );
    expect(within(pilotos).queryByRole('link', { name: 'Piloto Novato' })).toBeNull();
    expect(await within(construtores).findByRole('link', { name: 'McLaren' })).toHaveAttribute(
      'href',
      '/equipes/mclaren',
    );
    expect(within(construtores).queryByRole('link', { name: 'Equipe Nova' })).toBeNull();
  });
});
