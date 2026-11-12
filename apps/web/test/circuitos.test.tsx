import type { FichaDoCircuitoDTO, ResumoDoCircuitoDTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function circuito(
  id: string,
  nome: string,
  pais: string,
  noCalendarioAtual: boolean,
): ResumoDoCircuitoDTO {
  return {
    id,
    nome,
    cidade: 'Cidade',
    pais,
    latitude: 0,
    longitude: 0,
    wikipedia: null,
    noCalendarioAtual,
  };
}

describe('Circuitos', () => {
  it('busca pelo país em português e filtra os do calendário atual', async () => {
    servidor.use(
      http.get('*/api/circuitos', () =>
        HttpResponse.json([
          circuito('interlagos', 'Autódromo José Carlos Pace', 'Brazil', true),
          circuito('jacarepagua', 'Autódromo Internacional Nelson Piquet', 'Brazil', false),
          circuito('monza', 'Autodromo Nazionale di Monza', 'Italy', true),
        ]),
      ),
    );
    const { usuario } = renderizar('/circuitos');

    await usuario.type(await screen.findByRole('searchbox'), 'brasil');
    expect(screen.getByText('2 circuitos')).toBeInTheDocument();

    await usuario.click(screen.getByRole('checkbox', { name: /Só os do calendário/ }));
    expect(screen.getByText('1 circuito')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /José Carlos Pace/ })).toHaveAttribute(
      'href',
      '/circuitos/interlagos',
    );
  });

  it('mostra a ficha com os maiores vencedores e cada vitória ligada ao seu ano', async () => {
    const ficha: FichaDoCircuitoDTO = {
      ...circuito('monza', 'Autodromo Nazionale di Monza', 'Italy', true),
      vitorias: [
        {
          ano: 2019,
          rodada: 14,
          gp: 'Italian Grand Prix',
          piloto: 'Charles Leclerc',
          equipe: 'Ferrari',
        },
        {
          ano: 1950,
          rodada: 7,
          gp: 'Italian Grand Prix',
          piloto: 'Nino Farina',
          equipe: 'Alfa Romeo',
        },
      ],
      maioresPilotos: [{ nome: 'Lewis Hamilton', vitorias: 5 }],
      maioresEquipes: [{ nome: 'Ferrari', vitorias: 20 }],
      verbete: {
        resumo: 'Pista perto de Milão.',
        fonte: 'https://pt.wikipedia.org/wiki/Monza',
        fundacao: 1922,
        fundadores: [],
        sede: null,
      },
      proximaCorrida: null,
    };
    servidor.use(http.get('*/api/circuitos/:id', () => HttpResponse.json(ficha)));
    renderizar('/circuitos/monza');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Autodromo Nazionale di Monza' }),
    ).toBeVisible();
    expect(screen.getByText('Inauguração').nextSibling).toHaveTextContent('1922');
    expect(screen.getByText('Primeiro GP').nextSibling).toHaveTextContent('1950');
    expect(
      within(screen.getByRole('region', { name: 'Quem mais venceu aqui' })).getByText('5 vitórias'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1950' })).toHaveAttribute('href', '/historia/1950');
  });

  it('avisa quando o circuito não existe', async () => {
    servidor.use(
      http.get('*/api/circuitos/:id', () =>
        HttpResponse.json(
          { codigo: 'CIRCUITO_NAO_ENCONTRADO', mensagem: 'Circuito não encontrado.' },
          { status: 404 },
        ),
      ),
    );
    renderizar('/circuitos/inventado');

    expect(await screen.findByRole('heading', { name: 'Circuito não encontrado' })).toBeVisible();
  });
});
