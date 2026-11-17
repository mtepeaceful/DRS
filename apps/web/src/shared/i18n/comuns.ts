export const COMUNS = {
  pt: {
    tentarDeNovo: 'Tentar de novo',
    novaAba: ' (abre em nova aba)',
    pontos: 'pontos',
    vitorias: (quantas: number): string => (quantas === 1 ? 'vitória' : 'vitórias'),
  },
  en: {
    tentarDeNovo: 'Try again',
    novaAba: ' (opens in a new tab)',
    pontos: 'points',
    vitorias: (quantas: number): string => (quantas === 1 ? 'win' : 'wins'),
  },
};
