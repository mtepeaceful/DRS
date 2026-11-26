/**
 * Que equipe tem carro baixado do Sketchfab, e qual. Fica fora de modelo.ts
 * para as páginas saberem o nome do carro sem carregar o three.js.
 */
const CARROS = {
  mclaren: 'mcl40',
  ferrari: 'sf26',
  mercedes: 'w17',
  'red-bull': 'rb22',
  williams: 'fw48',
  'aston-martin': 'amr26',
  haas: 'vf26',
  audi: 'r26',
  sauber: 'r26',
  cadillac: 'mac26',
} as const;

export type ModeloDoSite = (typeof CARROS)[keyof typeof CARROS];

/** O modelo de uma equipe, pelo id da montagem ou pelo nome vindo da API. */
export function modeloDaEquipe(equipe: string): ModeloDoSite | undefined {
  const id = ` ${equipe
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

  // A Racing Bulls também tem "Bull" no nome, mas não tem modelo próprio.
  if (id.includes(' racing bulls ')) {
    return undefined;
  }

  const achado = Object.entries(CARROS).find(([chave]) =>
    id.includes(` ${chave.replace('-', ' ')} `),
  );
  return achado?.[1];
}
