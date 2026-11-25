import { describe, expect, it } from 'vitest';
import { PINTURAS, pinturaDaEquipe } from '../src/features/garagem/pinturas';

const DA_API = { cor: '#ff2d00', corSecundaria: '#ffffff' };

describe('pintura do carro de cada equipe', () => {
  it('usa a pintura real do carro, não a cor de destaque da API', () => {
    expect(pinturaDaEquipe('Audi', DA_API)).toEqual(PINTURAS.audi);
    expect(pinturaDaEquipe('Kick Sauber', DA_API)).toEqual(PINTURAS.audi);
  });

  it('não confunde a Red Bull com a Racing Bulls', () => {
    expect(pinturaDaEquipe('Red Bull Racing', DA_API)).toEqual(PINTURAS['red-bull-racing']);
    expect(pinturaDaEquipe('Racing Bulls', DA_API)).toEqual(PINTURAS['racing-bulls']);
    expect(pinturaDaEquipe('Visa Cash App RB', DA_API)).toEqual(PINTURAS['racing-bulls']);
  });

  it('cai nas cores da API quando a equipe não é conhecida', () => {
    expect(pinturaDaEquipe('Equipe Nova', DA_API)).toEqual(DA_API);
  });
});
