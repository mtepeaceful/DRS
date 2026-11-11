export interface OpcaoDeTransmissao {
  nome: string;
  tipo: string;
  descricao: string;
  site: string;
}

export const TEMPORADA_DO_GUIA = 2026;

export const ondeAssistir: OpcaoDeTransmissao[] = [
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
