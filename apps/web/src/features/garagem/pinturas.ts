import { chaveDaEquipe } from '../../shared/lib/equipe';
import {
  CAIXA_DA_RODA,
  CAIXA_DO_SIDEPOD,
  desenharCarroceria,
  desenharRoda,
} from '../equipes/carro/desenho';
import { pinturaDaEquipe as pinturaDoDesenho } from '../equipes/carro/pinturas';
import type { PinturaDoRedesenho } from './cena';

export interface PinturaDaEquipe {
  cor: string;
  corSecundaria: string;
}

// Cores da pintura de cada carro do grid atual. A cor que a OpenF1 manda para
// a equipe é a de destaque nas transmissões, nem sempre a da carroceria: a da
// Audi, por exemplo, é vermelha, mas o carro é titânio com detalhes vermelhos.
export const PINTURAS = {
  mclaren: { cor: '#ff8000', corSecundaria: '#111114' },
  mercedes: { cor: '#c8ccce', corSecundaria: '#00a19c' },
  ferrari: { cor: '#dc0000', corSecundaria: '#fff200' },
  'red-bull-racing': { cor: '#1e41ff', corSecundaria: '#ffcc00' },
  williams: { cor: '#0a2a6b', corSecundaria: '#00a0de' },
  'aston-martin': { cor: '#006f62', corSecundaria: '#cedc00' },
  'racing-bulls': { cor: '#6692ff', corSecundaria: '#ffffff' },
  alpine: { cor: '#0090ff', corSecundaria: '#ff87bc' },
  haas: { cor: '#f4f4f5', corSecundaria: '#e6002b' },
  audi: { cor: '#b5b8bd', corSecundaria: '#f50537' },
  cadillac: { cor: '#1b1b1f', corSecundaria: '#d9d9d9' },
} satisfies Record<string, PinturaDaEquipe>;

export type IdDaPintura = keyof typeof PINTURAS;

const NOMES: [trecho: string, id: IdDaPintura][] = [
  ['mclaren', 'mclaren'],
  ['mercedes', 'mercedes'],
  ['ferrari', 'ferrari'],
  ['red bull', 'red-bull-racing'],
  ['williams', 'williams'],
  ['aston', 'aston-martin'],
  ['racing bulls', 'racing-bulls'],
  ['visa', 'racing-bulls'],
  ['alphatauri', 'racing-bulls'],
  ['alpine', 'alpine'],
  ['haas', 'haas'],
  ['audi', 'audi'],
  ['sauber', 'audi'],
  ['cadillac', 'cadillac'],
];

/** Pintura real do carro da equipe, ou as cores que vieram da API quando a equipe não é conhecida. */
export function pinturaDaEquipe(nome: string, daApi: PinturaDaEquipe): PinturaDaEquipe {
  const normalizado = nome.toLowerCase();
  const encontrado = NOMES.filter(([trecho]) => normalizado.includes(trecho)).sort(
    ([a], [b]) => b.length - a.length,
  )[0];

  return encontrado ? PINTURAS[encontrado[1]] : daApi;
}

/**
 * A pintura do carro 3D tirada do redesenho 2D da equipe: as laterais
 * desenhadas, com patrocínios e número, e a cor de cada peça.
 */
export function pinturaDoRedesenho(
  nome: string,
  daApi: PinturaDaEquipe,
  numero?: number,
): PinturaDoRedesenho {
  const desenho = pinturaDoDesenho(nome, daApi);
  const sufixo = chaveDaEquipe(nome) || 'equipe';

  return {
    direita: desenharCarroceria(desenho, numero, `${sufixo}d`),
    esquerda: desenharCarroceria(desenho, numero, `${sufixo}e`, true),
    asaTraseira: desenho.asaTraseira ?? desenho.base,
    flap: desenho.flap ?? '#111114',
    endplate: desenho.endplate ?? desenho.base,
    flapDianteiro: desenho.flapDianteiro ?? desenho.base,
    capacete: desenho.capacete,
    retrovisor: desenho.retrovisor ?? desenho.base,
    sidepod: CAIXA_DO_SIDEPOD,
    roda: { svg: desenharRoda(desenho, `${sufixo}r`), caixa: CAIXA_DA_RODA },
  };
}
