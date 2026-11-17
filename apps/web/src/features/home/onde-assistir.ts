import type { Textos } from '../../shared/i18n/idioma';

export interface OpcaoDeTransmissao {
  nome: string;
  tipo: string;
  descricao: string;
  site: string;
}

export const TEMPORADA_DO_GUIA = 2026;

const emPortugues: OpcaoDeTransmissao[] = [
  {
    nome: 'TV Globo',
    tipo: 'TV aberta',
    descricao: 'A maioria das corridas ao vivo, de graça.',
    site: 'https://ge.globo.com/motor/formula-1/',
  },
  {
    nome: 'SporTV',
    tipo: 'TV por assinatura',
    descricao: 'Treinos, classificações, sprints e as corridas que não vão para a TV aberta.',
    site: 'https://sportv.globo.com/',
  },
  {
    nome: 'Globoplay',
    tipo: 'Streaming',
    descricao: 'Transmissão ao vivo dos canais Globo e SporTV, e as corridas completas depois.',
    site: 'https://globoplay.globo.com/',
  },
  {
    nome: 'F1 TV Pro',
    tipo: 'Streaming oficial',
    descricao: 'Todas as sessões ao vivo, câmeras onboard e rádio das equipes.',
    site: 'https://f1tv.formula1.com/',
  },
];

const tiposEmIngles: Record<string, string> = {
  'TV aberta': 'Free-to-air TV',
  'TV por assinatura': 'Pay TV',
  Streaming: 'Streaming',
  'Streaming oficial': 'Official streaming',
};

const descricoesEmIngles: Record<string, string> = {
  'TV Globo': 'Most races live, for free.',
  SporTV: 'Practice, qualifying, sprints and the races that are not on free-to-air TV.',
  Globoplay: 'Live stream of the Globo and SporTV channels, and full races afterwards.',
  'F1 TV Pro': 'Every session live, onboard cameras and team radio.',
};

export const ondeAssistir: Textos<OpcaoDeTransmissao[]> = {
  pt: emPortugues,
  en: emPortugues.map((opcao) => ({
    ...opcao,
    tipo: tiposEmIngles[opcao.tipo] ?? opcao.tipo,
    descricao: descricoesEmIngles[opcao.nome] ?? opcao.descricao,
  })),
};
