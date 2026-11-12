import type { FichaDaEquipeDTO, ResumoDaEquipeDTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function equipe(sobrescrita: Partial<ResumoDaEquipeDTO>): ResumoDaEquipeDTO {
  return {
    id: 'x',
    nome: 'X',
    pais: 'GB',
    wikipedia: null,
    titulosDeConstrutores: 0,
    titulosDePilotos: 0,
    noGridAtual: false,
    ...sobrescrita,
  };
}

const lista = [
  equipe({ id: 'brabham', nome: 'Brabham', titulosDePilotos: 2 }),
  equipe({
    id: 'ferrari',
    nome: 'Ferrari',
    pais: 'IT',
    titulosDeConstrutores: 16,
    titulosDePilotos: 15,
    noGridAtual: true,
  }),
  equipe({ id: 'minardi', nome: 'Minardi', pais: 'IT' }),
  equipe({ id: 'team_lotus', nome: 'Team Lotus', titulosDeConstrutores: 7, titulosDePilotos: 6 }),
];

describe('Dicionário de equipes', () => {
  it('destaca o grid atual e busca entre todas as equipes, inclusive sem acento', async () => {
    servidor.use(http.get('*/api/historia/equipes', () => HttpResponse.json(lista)));
    const { usuario } = renderizar('/equipes');

    const grid = await screen.findByRole('region', { name: /No grid em/ });
    expect(
      within(grid)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/equipes/ferrari']);

    const todas = screen.getByRole('region', { name: 'Todas as equipes' });
    await usuario.type(within(todas).getByRole('searchbox'), 'LÓTUS');

    expect(within(todas).getByText('1 equipe')).toBeInTheDocument();
    expect(within(todas).getByRole('link', { name: /Team Lotus/ })).toHaveTextContent(
      '7 títulos de construtores',
    );
  });

  it('filtra só as equipes campeãs', async () => {
    servidor.use(http.get('*/api/historia/equipes', () => HttpResponse.json(lista)));
    const { usuario } = renderizar('/equipes');

    await usuario.click(await screen.findByRole('checkbox', { name: 'Só as campeãs' }));

    const todas = screen.getByRole('region', { name: 'Todas as equipes' });
    expect(within(todas).getByText('3 equipes')).toBeInTheDocument();
    expect(within(todas).queryByRole('link', { name: /Minardi/ })).not.toBeInTheDocument();
  });

  it('mostra a ficha só com os dados que existem e o crédito da Wikipédia', async () => {
    const ficha: FichaDaEquipeDTO = {
      ...equipe({
        id: 'team_lotus',
        nome: 'Team Lotus',
        titulosDeConstrutores: 1,
        titulosDePilotos: 1,
      }),
      temporadas: [1958, 1994],
      corridas: 395,
      vitorias: 45,
      podios: 114,
      poles: 61,
      anosDeTitulo: [1978],
      campeoesDePilotos: [{ ano: 1978, piloto: 'Mario Andretti' }],
      verbete: {
        resumo: 'Equipe criada por Colin Chapman.',
        fonte: 'https://pt.wikipedia.org/wiki/Team_Lotus',
        foto: null,
        fundacao: 1954,
        fundadores: ['Colin Chapman'],
        sede: null,
      },
      temporadaAtual: null,
    };
    servidor.use(http.get('*/api/historia/equipes/:id', () => HttpResponse.json(ficha)));
    renderizar('/equipes/team_lotus');

    expect(await screen.findByRole('heading', { level: 1, name: 'Team Lotus' })).toBeVisible();
    expect(screen.getByText('Correu de 1958 a 1994')).toBeInTheDocument();
    expect(screen.getByText('Fundação por').nextSibling).toHaveTextContent('Colin Chapman');
    expect(screen.queryByText('Sede')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wikipédia/ })).toHaveAttribute(
      'href',
      'https://pt.wikipedia.org/wiki/Team_Lotus',
    );
    expect(
      screen.getAllByRole('link', { name: '1978' }).map((link) => link.getAttribute('href')),
    ).toEqual(['/historia/1978', '/historia/1978']);
    expect(screen.queryByRole('region', { name: /Temporada/ })).not.toBeInTheDocument();
  });

  it('avisa quando a equipe não existe', async () => {
    servidor.use(
      http.get('*/api/historia/equipes/:id', () =>
        HttpResponse.json(
          { codigo: 'EQUIPE_NAO_ENCONTRADA', mensagem: 'Equipe não encontrada.' },
          { status: 404 },
        ),
      ),
    );
    renderizar('/equipes/inventada');

    expect(await screen.findByRole('heading', { name: 'Equipe não encontrada' })).toBeVisible();
  });
});
