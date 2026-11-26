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

  it('dá à Alpine e à Racing Bulls o carro pintado com o desenho delas', () => {
    expect(modeloDaEquipe('alpine')).toBe('a526');
    expect(modeloDaEquipe('Alpine F1 Team')).toBe('a526');
    expect(modeloDaEquipe('racing-bulls')).toBe('vcarb03');
    expect(modeloDaEquipe('Visa Cash App Racing Bulls')).toBe('vcarb03');
    expect(modeloDaEquipe('RB F1 Team')).toBe('vcarb03');
  });

  it('deixa sem modelo uma equipe nova', () => {
    expect(modeloDaEquipe('Equipe Nova')).toBeUndefined();
  });
});
