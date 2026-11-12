import type { FichaDoPilotoDaF1DTO, ResumoDoPilotoDaF1DTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function piloto(id: string, nome: string, titulos: number): ResumoDoPilotoDaF1DTO {
  return { id, nome, pais: 'BR', nascimento: '1960-03-21', wikipedia: null, titulos };
}

const lista = [
  piloto('fangio', 'Juan Fangio', 5),
  piloto('barrichello', 'Rubens Barrichello', 0),
  piloto('senna', 'Ayrton Senna', 3),
  piloto('piquet', 'Nelson Piquet', 3),
];

function responderLista() {
  servidor.use(http.get('*/api/historia/pilotos', () => HttpResponse.json(lista)));
}

describe('Pilotos da história', () => {
  it('começa pelos campeões, do maior para o menor, e busca qualquer piloto sem acento', async () => {
    responderLista();
    const { usuario } = renderizar('/historia/pilotos');

    expect(await screen.findByRole('heading', { name: 'Campeões mundiais' })).toBeVisible();
    expect(
      screen.getAllByRole('link', { name: /títulos?/ }).map((link) => link.getAttribute('href')),
    ).toEqual(['/historia/pilotos/fangio', '/historia/pilotos/senna', '/historia/pilotos/piquet']);

    await usuario.type(screen.getByRole('searchbox'), 'RÚBENS');

    expect(screen.getByRole('heading', { name: '1 piloto encontrado' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Rubens Barrichello/ })).toHaveAttribute(
      'href',
      '/historia/pilotos/barrichello',
    );
  });

  it('mostra a ficha com as equipes e os anos de título ligados ao resto do dicionário', async () => {
    const ficha: FichaDoPilotoDaF1DTO = {
      ...piloto('senna', 'Ayrton Senna', 3),
      temporadas: [1984, 1994],
      corridas: 161,
      vitorias: 41,
      podios: 80,
      poles: 65,
      equipes: [
        { id: 'toleman', nome: 'Toleman' },
        { id: 'mclaren', nome: 'McLaren' },
      ],
      anosDeTitulo: [1988, 1990, 1991],
      verbete: null,
    };
    servidor.use(http.get('*/api/historia/pilotos/:id', () => HttpResponse.json(ficha)));
    renderizar('/historia/pilotos/senna');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ayrton Senna' })).toBeVisible();
    expect(screen.getByText('Correu de 1984 a 1994')).toBeInTheDocument();
    expect(screen.getByText('Vitórias').nextSibling).toHaveTextContent('41');
    expect(screen.getByRole('link', { name: 'Toleman' })).toHaveAttribute(
      'href',
      '/equipes/toleman',
    );
    expect(
      within(screen.getByRole('region', { name: 'Campeão mundial' }))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['1988', '1990', '1991']);
  });

  it('liga o nome do piloto nas temporadas antigas à ficha dele', async () => {
    servidor.use(
      http.get('*/api/historia/:ano', () =>
        HttpResponse.json({
          ano: 1988,
          corridas: [],
          pilotos: [
            {
              posicao: 1,
              nome: 'Ayrton Senna',
              pais: 'BR',
              equipes: ['McLaren'],
              pontos: 90,
              vitorias: 8,
            },
            {
              posicao: 2,
              nome: 'Piloto Sem Ficha',
              pais: null,
              equipes: ['X'],
              pontos: 1,
              vitorias: 0,
            },
          ],
          construtores: [],
        }),
      ),
    );
    responderLista();
    renderizar('/historia/1988');

    expect(await screen.findByRole('link', { name: 'Ayrton Senna' })).toHaveAttribute(
      'href',
      '/historia/pilotos/senna',
    );
    expect(screen.queryByRole('link', { name: 'Piloto Sem Ficha' })).not.toBeInTheDocument();
  });
});
