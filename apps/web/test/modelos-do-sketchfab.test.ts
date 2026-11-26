import { describe, expect, it } from 'vitest';
import { modeloDaEquipe } from '../src/features/garagem/modelos';

describe('modeloDaEquipe', () => {
  it('acha o carro pelo id da montagem e pelo nome da API', () => {
    expect(modeloDaEquipe('red-bull-racing')).toBe('rb22');
    expect(modeloDaEquipe('Red Bull Racing')).toBe('rb22');
    expect(modeloDaEquipe('aston-martin')).toBe('amr26');
    expect(modeloDaEquipe('Aston Martin Aramco')).toBe('amr26');
    expect(modeloDaEquipe('Kick Sauber')).toBe('r26');
    expect(modeloDaEquipe('Cadillac')).toBe('mac26');
  });

  it('deixa sem modelo as equipes que não têm um', () => {
    expect(modeloDaEquipe('racing-bulls')).toBeUndefined();
    expect(modeloDaEquipe('Visa Cash App Racing Bulls')).toBeUndefined();
    expect(modeloDaEquipe('Alpine')).toBeUndefined();
  });
});
