const COR_SEM_EQUIPE = '#6b6e78';

// Cores tradicionais das equipes campeãs, clareadas quando preciso para aparecer no fundo escuro.
const coresTradicionais: [trecho: string, cor: string, equipe?: string][] = [
  ['alfa romeo', '#c8323c'],
  ['ferrari', '#e8002d'],
  ['maserati', '#9e2a4f'],
  ['mercedes', '#27f4d2'],
  ['vanwall', '#2e8b57'],
  ['cooper', '#3cb371', 'Cooper'],
  ['brm', '#8fbc5a'],
  ['lotus', '#e2b13c', 'Lotus'],
  ['brabham', '#4f86d9', 'Brabham'],
  ['matra', '#6aa8ff', 'Matra'],
  ['tyrrell', '#2f62c9'],
  ['mclaren', '#ff8000'],
  ['williams', '#1e90ff'],
  ['benetton', '#19c37d'],
  ['renault', '#ffd400'],
  ['brawn', '#c7f43a'],
  ['red bull', '#3671c6'],
];

function equipeTradicional(equipe: string) {
  const nome = equipe.toLowerCase();

  return coresTradicionais.find(([trecho]) => nome.includes(trecho));
}

export function corDoTitulo(equipe: string) {
  return equipeTradicional(equipe)?.[1] ?? COR_SEM_EQUIPE;
}

/** Junta as variações de nome de uma mesma equipe, como Lotus-Climax, Lotus-Ford e Team Lotus. */
export function equipeDoTitulo(equipe: string) {
  return equipeTradicional(equipe)?.[2] ?? equipe;
}
