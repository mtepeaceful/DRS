import { fireEvent, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { banco, servidor } from './servidor';

function enderecoDoHamilton() {
  banco.reiniciar();
  const hamilton = banco.pilotos.find((piloto) => piloto.nome === 'Lewis Hamilton');

  return `/pilotos/${hamilton?.id}`;
}

const foto = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hamilton.jpg/500px-Hamilton.jpg',
  pagina: 'https://commons.wikimedia.org/wiki/File:Hamilton.jpg',
  autor: 'Fotógrafo',
  licenca: 'CC BY-SA 4.0',
};

describe('Página do piloto', () => {
  it('mostra a foto do Commons no grid e na página do piloto', async () => {
    const { usuario } = renderizar('/pilotos');
    banco.pilotos = banco.pilotos.map((piloto) =>
      piloto.nome === 'Lewis Hamilton' ? { ...piloto, foto } : piloto,
    );

    expect(
      await screen.findByText(/Fotos do Wikimedia Commons, com autor e licença na página/),
    ).toBeInTheDocument();

    await usuario.click(await screen.findByRole('link', { name: /Lewis Hamilton/ }));

    expect(await screen.findByRole('img', { name: 'Foto de Lewis Hamilton' })).toHaveAttribute(
      'src',
      foto.url,
    );
    expect(screen.getByRole('link', { name: /Foto: Fotógrafo · CC BY-SA 4.0/ })).toHaveAttribute(
      'href',
      foto.pagina,
    );
  });

  it('mostra o número do piloto na cor da equipe quando a foto não carrega', async () => {
    const { usuario } = renderizar('/pilotos');
    banco.pilotos = banco.pilotos.map((piloto) =>
      piloto.nome === 'Lewis Hamilton' ? { ...piloto, foto } : piloto,
    );

    const link = await screen.findByRole('link', { name: /Lewis Hamilton/ });
    const cartao = link.closest('article');
    const retrato = cartao?.querySelector(`img[src="${foto.url}"]`);

    expect(retrato).toBeTruthy();
    fireEvent.error(retrato as HTMLImageElement);

    expect(cartao?.querySelector(`img[src="${foto.url}"]`)).toBeNull();
    expect(within(cartao as HTMLElement).getAllByText('44')).toHaveLength(2);

    await usuario.click(link);
    fireEvent.error(await screen.findByRole('img', { name: 'Foto de Lewis Hamilton' }));

    expect(screen.queryByRole('img', { name: 'Foto de Lewis Hamilton' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Foto: Fotógrafo/ })).not.toBeInTheDocument();
    expect(screen.getAllByText('44')).toHaveLength(2);
  });

  it('mostra a carreira com os anos de título levando à história', async () => {
    servidor.use(
      http.get('*/api/pilotos/:id/carreira', () =>
        HttpResponse.json({
          nascimento: '1985-01-07',
          estreia: 2007,
          temporadas: 20,
          corridas: 400,
          vitorias: 106,
          podios: 209,
          poles: 105,
          titulos: [2008, 2020],
        }),
      ),
    );
    renderizar(enderecoDoHamilton());

    const carreira = await screen.findByRole('region', { name: 'Carreira na F1' });

    expect(within(carreira).getByText('Vitórias').nextSibling).toHaveTextContent('106');
    expect(within(carreira).getByText(/nasceu em 7 de janeiro de 1985/)).toBeInTheDocument();
    expect(within(carreira).getByText('2 títulos mundiais')).toBeInTheDocument();
    expect(within(carreira).getByRole('link', { name: '2008' })).toHaveAttribute(
      'href',
      '/historia/2008',
    );
  });

  it('mostra a temporada corrida a corrida com o nome de cada GP', async () => {
    servidor.use(
      http.get('*/api/temporada/pilotos', () =>
        HttpResponse.json({
          ano: 2026,
          rodadasDisputadas: 2,
          pilotos: [
            {
              nome: 'Lewis Hamilton',
              equipe: 'Ferrari',
              posicao: 4,
              pontos: 25,
              vitorias: 1,
              podios: 1,
              poles: 0,
              corridas: 2,
              abandonos: 1,
              melhorResultado: 1,
              mediaDeChegada: 1,
              etapas: [
                { rodada: 1, posicao: 1, largada: 3, pontos: 25 },
                { rodada: 2, posicao: null, largada: 0, pontos: 0 },
              ],
            },
          ],
        }),
      ),
      http.get('*/api/calendario', () =>
        HttpResponse.json([
          {
            rodada: 1,
            nome: 'Australian Grand Prix',
            circuito: 'Albert Park',
            circuitoId: 'albert_park',
            cidade: 'Melbourne',
            pais: 'Australia',
            inicio: '2026-03-08T04:00:00.000Z',
            sessoes: [],
            vencedor: { nome: 'Lewis Hamilton', equipe: 'Ferrari' },
          },
        ]),
      ),
    );
    renderizar(enderecoDoHamilton());

    const temporada = await screen.findByRole('region', { name: 'Temporada 2026' });

    expect(
      within(temporada).getByText(/4º no campeonato · 25 pts · 1 vitória/),
    ).toBeInTheDocument();
    expect(within(temporada).getByRole('row', { name: /GP da Austrália/ })).toHaveTextContent(
      'GP da Austrália3º1º25',
    );
    expect(within(temporada).getByRole('row', { name: /Etapa 2/ })).toHaveTextContent(
      'Etapa 2BoxNC0',
    );
  });

  it('não mostra as seções quando não há dados do piloto na F1', async () => {
    renderizar(enderecoDoHamilton());

    expect(await screen.findByRole('heading', { level: 1, name: 'Lewis Hamilton' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Carreira na F1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Temporada/ })).not.toBeInTheDocument();
  });
});
