import type { EtapaDTO } from '@drs/contracts';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function etapa(rodada: number, inicio: string, vencedor: EtapaDTO['vencedor']): EtapaDTO {
  return {
    rodada,
    nome: 'Las Vegas Grand Prix',
    circuito: 'Las Vegas Strip Street Circuit',
    circuitoId: 'vegas',
    cidade: 'Las Vegas',
    pais: 'USA',
    inicio,
    sessoes: [],
    vencedor,
  };
}

describe('Lembrete no calendário', () => {
  it('baixa um arquivo de calendário só com as corridas que ainda vão acontecer', async () => {
    servidor.use(
      http.get('*/api/calendario', () =>
        HttpResponse.json([
          etapa(1, '2020-03-08T04:00:00.000Z', { nome: 'X', equipe: 'Y' }),
          etapa(2, '2099-11-22T04:00:00.000Z', null),
        ]),
      ),
    );
    const criar = vi.spyOn(URL, 'createObjectURL');
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { usuario } = renderizar('/calendario');

    await usuario.click(
      await screen.findByRole('button', {
        name: 'Lembrar das próximas corridas',
      }),
    );

    const arquivo = criar.mock.calls[0]?.[0] as Blob | undefined;
    const conteudo = (await arquivo?.text()) ?? '';
    expect(clique).toHaveBeenCalledOnce();
    expect(conteudo).toContain('BEGIN:VCALENDAR');
    expect(conteudo.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(conteudo).toContain('UID:2099-2-corrida@drs');
  });
});
