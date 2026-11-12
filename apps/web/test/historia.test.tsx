import type { HistoriaDosCampeoesDTO, TemporadaHistoricaDTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

const historia: HistoriaDosCampeoesDTO = {
  temporadas: [
    {
      ano: 1988,
      piloto: 'Ayrton Senna',
      pais: 'BR',
      equipe: 'McLaren',
      pontos: 90,
      vitorias: 8,
      construtor: { nome: 'McLaren', pontos: 199, vitorias: 15 },
    },
    {
      ano: 1952,
      piloto: 'Alberto Ascari',
      pais: 'IT',
      equipe: 'Ferrari',
      pontos: 36,
      vitorias: 6,
      construtor: null,
    },
  ],
  faltando: 3,
  maioresPilotos: [{ nome: 'Ayrton Senna', pais: 'BR', titulos: 1, anos: [1988] }],
  maioresConstrutores: [{ nome: 'McLaren', pais: null, titulos: 1, anos: [1988] }],
};

const temporada1952: TemporadaHistoricaDTO = {
  ano: 1952,
  corridas: [
    {
      rodada: 1,
      nome: 'Swiss Grand Prix',
      circuito: 'Bremgarten',
      pais: 'Switzerland',
      data: '1952-05-18',
      vencedor: { nome: 'Piero Taruffi', equipe: 'Ferrari' },
    },
  ],
  pilotos: [
    {
      posicao: 1,
      nome: 'Alberto Ascari',
      pais: 'IT',
      equipes: ['Ferrari'],
      pontos: 36,
      vitorias: 6,
    },
    {
      posicao: 2,
      nome: 'Nino Farina',
      pais: 'IT',
      equipes: ['Ferrari'],
      pontos: 24.5,
      vitorias: 0,
    },
  ],
  construtores: [],
};

describe('História da F1', () => {
  it('mostra os campeões por década com o ranking e o aviso de busca em andamento', async () => {
    servidor.use(http.get('*/api/historia/campeoes', () => HttpResponse.json(historia)));
    renderizar('/historia');

    expect(
      await screen.findByText('Buscando o restante das temporadas: faltam 3.'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Décadas' }))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['1980', '1950']);
    expect(screen.getByRole('link', { name: /1988.*Ayrton Senna/ })).toHaveAttribute(
      'href',
      '/historia/1988',
    );
    expect(screen.getByRole('link', { name: /1952/ })).toHaveTextContent('Ainda não havia');
  });

  it('abre uma temporada com classificação, corridas e navegação entre anos', async () => {
    servidor.use(http.get('*/api/historia/:ano', () => HttpResponse.json(temporada1952)));
    renderizar('/historia/1952');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Alberto Ascari');
    expect(screen.getByRole('row', { name: /Nino Farina/ })).toHaveTextContent('24,5');
    expect(
      screen.getByText('O campeonato de construtores só começou em 1958.'),
    ).toBeInTheDocument();
    expect(screen.getByText('GP da Suíça')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← 1951' })).toHaveAttribute('href', '/historia/1951');
    expect(screen.getByRole('link', { name: '1953 →' })).toHaveAttribute('href', '/historia/1953');
  });

  it('explica quando o ano está fora do histórico', async () => {
    servidor.use(
      http.get('*/api/historia/:ano', () =>
        HttpResponse.json(
          { codigo: 'TEMPORADA_NAO_ENCONTRADA', mensagem: 'Temporada fora do histórico.' },
          { status: 404 },
        ),
      ),
    );
    renderizar('/historia/2026');

    expect(
      await screen.findByRole('heading', { name: 'Temporada fora do histórico' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar à história' })).toHaveAttribute(
      'href',
      '/historia',
    );
  });
});
