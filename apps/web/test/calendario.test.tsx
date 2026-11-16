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
    circuitoId: `circuito_${rodada}`,
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

    const [disputada, proxima, futura] = within(
      await within(await screen.findByRole('main')).findByRole('list'),
    ).getAllByRole('listitem');

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

describe('Resultado do fim de semana', () => {
  const linha = (posicao: number, nome: string) => ({
    posicao,
    classificado: true,
    nome,
    numero: posicao * 10,
    equipe: 'McLaren',
    largada: posicao,
    voltas: 24,
    tempo: posicao === 1 ? '30:25.318' : `+${posicao}.000`,
    situacao: 'Completou',
    pontos: 9 - posicao,
    voltaMaisRapida: false,
  });

  function responder(sprint: boolean) {
    servidor.use(
      http.get('*/api/calendario/:rodada', () =>
        HttpResponse.json({
          etapa: etapa(12, 'Dutch Grand Prix', null),
          classificacao: [
            linha(1, 'Lando Norris'),
            linha(2, 'Oscar Piastri'),
            linha(3, 'George Russell'),
          ],
          sprint: sprint ? [linha(1, 'George Russell')] : [],
          qualificacao: [
            {
              posicao: 1,
              nome: 'Lando Norris',
              numero: 1,
              equipe: 'McLaren',
              q1: '1:12.001',
              q2: '1:11.500',
              q3: '1:11.163',
            },
            {
              posicao: 2,
              nome: 'Lance Stroll',
              numero: 18,
              equipe: 'Aston Martin',
              q1: '1:13.818',
              q2: null,
              q3: null,
            },
          ],
        }),
      ),
    );
  }

  it('abre na corrida e troca para a classificação guardando a escolha no endereço', async () => {
    responder(true);
    const { router, usuario } = renderizar('/calendario/12');
    const sessoes = await screen.findByRole('navigation', { name: 'Sessões do fim de semana' });

    expect(
      within(sessoes)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Corrida', 'Sprint', 'Classificação']);
    expect(within(sessoes).getByRole('link', { name: 'Corrida' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('region', { name: 'Pódio' })).toBeInTheDocument();

    await usuario.click(within(sessoes).getByRole('link', { name: 'Classificação' }));

    expect(router.state.location.search).toBe('?sessao=classificacao');
    expect(screen.getByRole('row', { name: /Lance Stroll/ })).toHaveTextContent('1:13.818 · Q1');
  });

  it('esconde a aba de sprint quando o fim de semana não teve uma', async () => {
    responder(false);
    renderizar('/calendario/12?sessao=sprint');

    const sessoes = await screen.findByRole('navigation', { name: 'Sessões do fim de semana' });

    expect(within(sessoes).queryByRole('link', { name: 'Sprint' })).not.toBeInTheDocument();
    expect(within(sessoes).getByRole('link', { name: 'Corrida' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
