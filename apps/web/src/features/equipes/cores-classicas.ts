import type { CoresDaEquipe } from '../../shared/lib/equipe';

const classicas: Record<string, CoresDaEquipe> = {
  ferrari: { cor: '#dc0000', corSecundaria: '#fff200' },
  mclaren: { cor: '#ff8000', corSecundaria: '#000000' },
  mercedes: { cor: '#c8ccce', corSecundaria: '#00a19c' },
  williams: { cor: '#ffffff', corSecundaria: '#00a0de' },
  'red bull racing': { cor: '#1e41ff', corSecundaria: '#ffcc00' },
  'red bull': { cor: '#1e41ff', corSecundaria: '#ffcc00' },
  audi: { cor: '#000000', corSecundaria: '#00c853' },
  alpine: { cor: '#0090ff', corSecundaria: '#ff87bc' },
  'aston martin': { cor: '#006f62', corSecundaria: '#cedc00' },
  haas: { cor: '#ffffff', corSecundaria: '#e6002b' },
  'racing bulls': { cor: '#6692ff', corSecundaria: '#ffffff' },
  sauber: { cor: '#52e252', corSecundaria: '#000000' },
  lotus: { cor: '#000000', corSecundaria: '#c5a35a' },
  renault: { cor: '#ffd800', corSecundaria: '#000000' },
  jordan: { cor: '#ffd800', corSecundaria: '#0a0a0b' },
  benetton: { cor: '#00a651', corSecundaria: '#0072ce' },
  brabham: { cor: '#f4f4f5', corSecundaria: '#1b3f8b' },
};

const neutras: CoresDaEquipe = { cor: '#8a8d96', corSecundaria: '#ffffff' };

export function coresSugeridas(nome: string) {
  return classicas[nome.trim().toLowerCase()] ?? neutras;
}
