import { nomeDoGp } from '../../shared/lib/traducoes';

export interface Compromisso {
  id: string;
  titulo: string;
  local: string;
  inicio: Date;
  duracaoEmMinutos: number;
  avisoEmMinutos: number | null;
}

const QUEBRA = '\r\n';
const LIMITE_DA_LINHA = 75;

function instante(data: Date) {
  return data
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function texto(valor: string) {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function dobrar(linha: string) {
  const bytes = new TextEncoder();
  const partes: string[] = [];
  let atual = '';

  for (const caractere of linha) {
    const limite = partes.length === 0 ? LIMITE_DA_LINHA : LIMITE_DA_LINHA - 1;

    if (bytes.encode(atual + caractere).length > limite) {
      partes.push(atual);
      atual = '';
    }

    atual += caractere;
  }

  partes.push(atual);

  return partes.join(`${QUEBRA} `);
}

export function gerarIcs(compromissos: Compromisso[], agora = new Date()) {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DRS//Data Retrieval System//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const compromisso of compromissos) {
    const fim = new Date(compromisso.inicio.getTime() + compromisso.duracaoEmMinutos * 60_000);

    linhas.push(
      'BEGIN:VEVENT',
      `UID:${compromisso.id}@drs`,
      `DTSTAMP:${instante(agora)}`,
      `DTSTART:${instante(compromisso.inicio)}`,
      `DTEND:${instante(fim)}`,
      `SUMMARY:${texto(compromisso.titulo)}`,
      `LOCATION:${texto(compromisso.local)}`,
    );

    if (compromisso.avisoEmMinutos !== null) {
      linhas.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${texto(compromisso.titulo)}`,
        `TRIGGER:-PT${compromisso.avisoEmMinutos}M`,
        'END:VALARM',
      );
    }

    linhas.push('END:VEVENT');
  }

  linhas.push('END:VCALENDAR');

  return linhas.map(dobrar).join(QUEBRA) + QUEBRA;
}

export function baixarIcs(nomeDoArquivo: string, conteudo: string) {
  const endereco = URL.createObjectURL(
    new Blob([conteudo], { type: 'text/calendar;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = endereco;
  link.download = nomeDoArquivo;
  link.click();
  URL.revokeObjectURL(endereco);
}

interface Corrida {
  rodada: number;
  nome: string;
  circuito: string;
  cidade: string;
  inicio: string;
  sessoes: { nome: string; inicio: string }[];
}

const DURACAO_DA_CORRIDA = 120;
const DURACAO_DAS_OUTRAS_SESSOES = 60;
const AVISO_DA_CORRIDA = 60;
const AVISO_DAS_SESSOES_DECISIVAS = 30;
const SESSOES_DECISIVAS = new Set(['Sprint', 'Classificação', 'Classificação sprint']);

function identificador(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function aviso(sessao: string) {
  if (sessao === 'Corrida') return AVISO_DA_CORRIDA;

  return SESSOES_DECISIVAS.has(sessao) ? AVISO_DAS_SESSOES_DECISIVAS : null;
}

export function compromissosDoFimDeSemana(corrida: Corrida) {
  const ano = new Date(corrida.inicio).getUTCFullYear();

  return corrida.sessoes.map((sessao): Compromisso => ({
    id: `${ano}-${corrida.rodada}-${identificador(sessao.nome)}`,
    titulo: `${nomeDoGp(corrida.nome)} · ${sessao.nome}`,
    local: `${corrida.circuito}, ${corrida.cidade}`,
    inicio: new Date(sessao.inicio),
    duracaoEmMinutos: sessao.nome === 'Corrida' ? DURACAO_DA_CORRIDA : DURACAO_DAS_OUTRAS_SESSOES,
    avisoEmMinutos: aviso(sessao.nome),
  }));
}

export function compromissosDaTemporada(
  corridas: (Corrida & { vencedor: unknown })[],
  agora = new Date(),
) {
  return corridas
    .filter((corrida) => !corrida.vencedor && new Date(corrida.inicio) > agora)
    .map((corrida): Compromisso => ({
      id: `${new Date(corrida.inicio).getUTCFullYear()}-${corrida.rodada}-corrida`,
      titulo: `${nomeDoGp(corrida.nome)} · Corrida`,
      local: `${corrida.circuito}, ${corrida.cidade}`,
      inicio: new Date(corrida.inicio),
      duracaoEmMinutos: DURACAO_DA_CORRIDA,
      avisoEmMinutos: AVISO_DA_CORRIDA,
    }));
}
