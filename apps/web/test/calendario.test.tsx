import type { EtapaDTO } from '@drs/contracts';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function etapa(rodada: number, nome: string, vencedor: EtapaDTO['vencedor']): EtapaDTO {
  return {
    rodada,
    nome,
    circuito: `Circuito ${rodada}`,
    cidade: 'Cidade',
    pais: 'Brazil',
    inicio: `2026-11-${String(rodada).padStart(2, '0')}T17:00:00.000Z`,
    sessoes: [],
    vencedor,
  };
}

describe('Calendário', () => {
  it('liga só as corridas disputadas à classificação e destaca a próxima', async () => {
    servidor.use(
      http.get('*/api/calendario', () =>
        HttpResponse.json([
          etapa(1, 'Brazilian Grand Prix', { nome: 'Lando Norris', equipe: 'McLaren' }),
          etapa(2, 'Las Vegas Grand Prix', null),
          etapa(3, 'Qatar Grand Prix', null),
        ]),
      ),
    );
    renderizar('/calendario');

    const [disputada, proxima, futura] = within(await screen.findByRole('list')).getAllByRole(
      'listitem',
    );

    expect(screen.getByText('1 de 3 etapas disputadas.', { exact: false })).toBeInTheDocument();
    expect(within(disputada as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      '/calendario/1',
    );
    expect(disputada).toHaveTextContent('GP de São Paulo');
    expect(disputada).toHaveTextContent('Lando Norris');
    expect(within(proxima as HTMLElement).queryByRole('link')).not.toBeInTheDocument();
    expect(proxima).toHaveTextContent('Próxima corrida');
    expect(futura).toHaveTextContent('Em breve');
  });

  it('avisa quando a etapa não existe', async () => {
    servidor.use(
      http.get('*/api/calendario/:rodada', () =>
        HttpResponse.json(
          { codigo: 'ETAPA_NAO_ENCONTRADA', mensagem: 'Etapa não encontrada.' },
          { status: 404 },
        ),
      ),
    );
    renderizar('/calendario/30');

    expect(
      await screen.findByRole('heading', { name: 'Etapa não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao calendário' })).toHaveAttribute(
      'href',
      '/calendario',
    );
  });
});
