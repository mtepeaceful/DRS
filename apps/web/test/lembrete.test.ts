import { describe, expect, it } from 'vitest';
import {
  compromissosDaTemporada,
  compromissosDoFimDeSemana,
  gerarIcs,
} from '../src/features/calendario/lembrete';

const AGORA = new Date('2026-11-12T12:00:00Z');

const lasVegas = {
  rodada: 21,
  nome: 'Las Vegas Grand Prix',
  circuito: 'Las Vegas Strip Street Circuit',
  cidade: 'Las Vegas',
  inicio: '2026-11-22T04:00:00.000Z',
  sessoes: [
    { nome: 'Treino livre 1', inicio: '2026-11-20T00:30:00.000Z' },
    { nome: 'Classificação', inicio: '2026-11-21T04:00:00.000Z' },
    { nome: 'Corrida', inicio: '2026-11-22T04:00:00.000Z' },
  ],
};

describe('gerarIcs', () => {
  it('gera um calendário válido, com quebras CRLF e o aviso antes do compromisso', () => {
    const ics = gerarIcs(
      [
        {
          id: '2026-21-corrida',
          titulo: 'GP de Las Vegas · Corrida',
          local: 'Las Vegas Strip Street Circuit, Las Vegas',
          inicio: new Date('2026-11-22T04:00:00Z'),
          duracaoEmMinutos: 120,
          avisoEmMinutos: 60,
        },
      ],
      AGORA,
    );

    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics).toContain('DTSTART:20261122T040000Z\r\nDTEND:20261122T060000Z');
    expect(ics).toContain('SUMMARY:GP de Las Vegas · Corrida');
    expect(ics).toContain(String.raw`LOCATION:Las Vegas Strip Street Circuit\, Las Vegas`);
    expect(ics).toContain('BEGIN:VALARM\r\nACTION:DISPLAY');
    expect(ics).toContain('TRIGGER:-PT60M');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('dobra linhas longas sem passar de 75 bytes', () => {
    const ics = gerarIcs(
      [
        {
          id: 'longo',
          titulo: 'Título bem comprido com acentuação: é, ã, ç, '.repeat(4),
          local: 'Lugar',
          inicio: AGORA,
          duracaoEmMinutos: 60,
          avisoEmMinutos: null,
        },
      ],
      AGORA,
    );
    const linhas = ics.split('\r\n');

    expect(linhas.every((linha) => new TextEncoder().encode(linha).length <= 75)).toBe(true);
    expect(linhas.some((linha) => linha.startsWith(' '))).toBe(true);
    expect(ics).not.toContain('VALARM');
  });
});

describe('compromissos', () => {
  it('avisa antes da corrida e da classificação, mas não dos treinos', () => {
    const compromissos = compromissosDoFimDeSemana(lasVegas);

    expect(compromissos.map((c) => [c.titulo, c.avisoEmMinutos, c.duracaoEmMinutos])).toEqual([
      ['GP de Las Vegas · Treino livre 1', null, 60],
      ['GP de Las Vegas · Classificação', 30, 60],
      ['GP de Las Vegas · Corrida', 60, 120],
    ]);
  });

  it('leva para a temporada só as corridas que ainda vão acontecer', () => {
    const compromissos = compromissosDaTemporada(
      [
        { ...lasVegas, rodada: 20, inicio: '2026-11-08T17:00:00.000Z', vencedor: { nome: 'X' } },
        { ...lasVegas, vencedor: null },
      ],
      AGORA,
    );

    expect(compromissos.map((c) => c.id)).toEqual(['2026-21-corrida']);
  });
});
