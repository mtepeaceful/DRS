import type { DesempenhoDaTemporadaDTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function piloto(
  posicao: number,
  nome: string,
  equipe: string,
  pontos: number,
  posicoes: (number | null)[],
): DesempenhoDaTemporadaDTO['pilotos'][number] {
  return {
    nome,
    equipe,
    posicao,
    pontos,
    vitorias: posicoes.filter((p) => p === 1).length,
    podios: posicoes.filter((p) => p !== null && p <= 3).length,
    poles: 0,
    corridas: posicoes.length,
    abandonos: posicoes.filter((p) => p === null).length,
    melhorResultado: Math.min(...posicoes.filter((p) => p !== null)),
    mediaDeChegada: 2,
    etapas: posicoes.map((p, indice) => ({
      rodada: indice + 1,
      posicao: p,
      largada: posicao,
      pontos: p === 1 ? 25 : 10,
    })),
  };
}

const temporada: DesempenhoDaTemporadaDTO = {
  ano: 2026,
  rodadasDisputadas: 3,
  pilotos: [
    piloto(1, 'Andrea Kimi Antonelli', 'Mercedes', 60, [1, 1, 2]),
    piloto(2, 'Max Verstappen', 'Red Bull', 45, [2, 3, 1]),
    piloto(3, 'Lewis Hamilton', 'Ferrari', 30, [3, null, 4]),
  ],
};

beforeEach(() => {
  servidor.use(
    http.get('*/api/temporada/pilotos', () => HttpResponse.json(temporada)),
    http.get('*/api/calendario', () => HttpResponse.json([])),
  );
});

describe('Comparar pilotos', () => {
  it('começa com os dois primeiros do campeonato', async () => {
    renderizar('/comparar');

    expect(await screen.findByLabelText('Piloto A')).toHaveDisplayValue(
      '1º · Andrea Kimi Antonelli',
    );
    expect(screen.getByLabelText('Piloto B')).toHaveDisplayValue('2º · Max Verstappen');
    expect(screen.getByText('Temporada 2026, depois de 3 etapas.')).toBeInTheDocument();
  });

  it('mostra quem terminou à frente e os números lado a lado', async () => {
    renderizar('/comparar');

    const frente = await screen.findByRole('region', { name: 'Frente a frente' });
    expect(
      within(frente).getByText('Andrea Kimi Antonelli 2, Max Verstappen 1'),
    ).toBeInTheDocument();

    const pontos = screen.getByRole('row', { name: /Pontos/ });
    expect(
      within(pontos)
        .getAllByRole('cell')
        .map((celula) => celula.textContent),
    ).toEqual(['60', '45']);
  });

  it('guarda a escolha no endereço e não deixa escolher o mesmo piloto dos dois lados', async () => {
    const { router, usuario } = renderizar('/comparar');
    const pilotoB = await screen.findByLabelText('Piloto B');

    expect(
      within(pilotoB).queryByRole('option', { name: /Andrea Kimi Antonelli/ }),
    ).not.toBeInTheDocument();

    await usuario.selectOptions(pilotoB, 'Lewis Hamilton');

    expect(router.state.location.search).toBe('?a=Andrea+Kimi+Antonelli&b=Lewis+Hamilton');
    expect(
      within(screen.getByRole('row', { name: /Abandonos/ }))
        .getAllByRole('cell')
        .map((celula) => celula.textContent),
    ).toEqual(['0', '1']);
  });

  it('troca os lados', async () => {
    const { usuario } = renderizar('/comparar?a=Lewis+Hamilton&b=Max+Verstappen');

    await usuario.click(await screen.findByRole('button', { name: 'Trocar os lados' }));

    expect(screen.getByLabelText('Piloto A')).toHaveDisplayValue('2º · Max Verstappen');
    expect(screen.getByLabelText('Piloto B')).toHaveDisplayValue('3º · Lewis Hamilton');
  });

  it('abre a partir da página do piloto com ele já escolhido', async () => {
    renderizar('/comparar?a=Lewis+Hamilton');

    expect(await screen.findByLabelText('Piloto A')).toHaveDisplayValue('3º · Lewis Hamilton');
    expect(screen.getByLabelText('Piloto B')).toHaveDisplayValue('1º · Andrea Kimi Antonelli');
  });

  it('oferece os pontos de cada etapa em tabela', async () => {
    const { usuario } = renderizar('/comparar');

    await usuario.click(await screen.findByText('Ver os dados em tabela'));

    expect(screen.getByRole('row', { name: 'Etapa 3 60 45' })).toBeInTheDocument();
  });
});
