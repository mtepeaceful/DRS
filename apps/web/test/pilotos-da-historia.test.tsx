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
  it('lista todos os pilotos em ordem alfabética e filtra os campeões', async () => {
    responderLista();
    const { usuario } = renderizar('/historia/pilotos');

    expect(await screen.findByRole('heading', { name: 'Todos os pilotos' })).toBeVisible();
    expect(
      within(within(screen.getByRole('main')).getByRole('list'))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/historia/pilotos/senna',
      '/historia/pilotos/fangio',
      '/historia/pilotos/piquet',
      '/historia/pilotos/barrichello',
    ]);
    expect(screen.getByText('Mostrando 4 de 4')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Campeões' }));

    expect(screen.getByRole('heading', { name: 'Campeões mundiais' })).toBeVisible();
    expect(
      within(within(screen.getByRole('main')).getByRole('list'))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/historia/pilotos/fangio', '/historia/pilotos/senna', '/historia/pilotos/piquet']);
  });

  it('busca qualquer piloto sem acento', async () => {
    responderLista();
    const { usuario } = renderizar('/historia/pilotos');

    await usuario.type(await screen.findByRole('searchbox'), 'RÚBENS');

    expect(screen.getByRole('heading', { name: '1 piloto encontrado' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Rubens Barrichello/ })).toHaveAttribute(
      'href',
      '/historia/pilotos/barrichello',
    );
  });

  it('mostra 60 pilotos por vez', async () => {
    servidor.use(
      http.get('*/api/historia/pilotos', () =>
        HttpResponse.json(
          Array.from({ length: 130 }, (_, indice) =>
            piloto(`p${indice}`, `Piloto ${String(indice).padStart(3, '0')}`, 0),
          ),
        ),
      ),
    );
    const { usuario } = renderizar('/historia/pilotos');

    expect(await screen.findByText('Mostrando 60 de 130')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Mostrar mais pilotos' }));
    expect(screen.getByText('Mostrando 120 de 130')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Mostrar mais pilotos' }));
    expect(screen.getByText('Mostrando 130 de 130')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mostrar mais pilotos' })).not.toBeInTheDocument();
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

  it('mostra a foto do Commons com o crédito do autor e da licença', async () => {
    servidor.use(
      http.get('*/api/historia/pilotos/:id', () =>
        HttpResponse.json({
          ...piloto('senna', 'Ayrton Senna', 3),
          temporadas: [1984, 1994],
          corridas: 161,
          vitorias: 41,
          podios: 80,
          poles: 65,
          equipes: [],
          anosDeTitulo: [],
          verbete: {
            resumo: 'Piloto brasileiro.',
            fonte: 'https://pt.wikipedia.org/wiki/Ayrton_Senna',
            foto: {
              url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Senna.jpg/500px-Senna.jpg',
              pagina: 'https://commons.wikimedia.org/wiki/File:Senna.jpg',
              autor: 'Martin Lee',
              licenca: 'CC BY-SA 2.0',
            },
            fundacao: null,
            fundadores: [],
            sede: null,
          },
        }),
      ),
    );
    renderizar('/historia/pilotos/senna');

    expect(await screen.findByRole('img', { name: 'Foto de Ayrton Senna' })).toHaveAttribute(
      'src',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Senna.jpg/500px-Senna.jpg',
    );
    expect(screen.getByRole('link', { name: /Foto: Martin Lee · CC BY-SA 2.0/ })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Senna.jpg',
    );
  });
});
