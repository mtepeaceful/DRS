import type { EquipeDTO, ResumoDaEquipeDTO } from '@drs/contracts';
import { describe, expect, it } from 'vitest';
import { montarGrid } from '../src/features/equipes/grid';

function daHistoria(id: string, nome: string, noGridAtual = true): ResumoDaEquipeDTO {
  return {
    id,
    nome,
    pais: null,
    wikipedia: null,
    titulosDeConstrutores: 0,
    titulosDePilotos: 0,
    noGridAtual,
  };
}

const redBull: EquipeDTO = {
  id: '6f1b0a3e-1c1f-4b7e-9a51-5c2b8f0e0010',
  nome: 'Red Bull Racing',
  cor: '#3671c6',
  corSecundaria: '#ffd12e',
};

const cadillac: EquipeDTO = {
  id: '6f1b0a3e-1c1f-4b7e-9a51-5c2b8f0e0011',
  nome: 'Cadillac',
  cor: '#c0c0c0',
  corSecundaria: '#000000',
};

describe('Grid de equipes', () => {
  it('junta a ficha, as cores e os pilotos mesmo com nomes diferentes nas fontes', () => {
    const grid = montarGrid(
      [daHistoria('red_bull', 'Red Bull'), daHistoria('lotus', 'Lotus', false)],
      [redBull],
      [
        { nome: 'Isack Hadjar', numero: 6, equipe: redBull },
        { nome: 'Max Verstappen', numero: 3, equipe: redBull },
      ],
    );

    expect(grid).toEqual([
      {
        id: 'red_bull',
        nome: 'Red Bull',
        cores: { cor: '#3671c6', corSecundaria: '#ffd12e' },
        pilotos: [
          { nome: 'Max Verstappen', numero: 3 },
          { nome: 'Isack Hadjar', numero: 6 },
        ],
      },
    ]);
  });

  it('não esconde a equipe com pilotos que ainda não está na ficha do grid', () => {
    const grid = montarGrid(
      [],
      [cadillac],
      [{ nome: 'Sergio Pérez', numero: 11, equipe: cadillac }],
    );

    expect(grid).toEqual([
      {
        id: null,
        nome: 'Cadillac',
        cores: { cor: '#c0c0c0', corSecundaria: '#000000' },
        pilotos: [{ nome: 'Sergio Pérez', numero: 11 }],
      },
    ]);
  });

  it('usa as cores clássicas quando a equipe não está cadastrada', () => {
    const [ferrari] = montarGrid([daHistoria('ferrari', 'Ferrari')], [], []);

    expect(ferrari?.cores).toEqual({ cor: '#dc0000', corSecundaria: '#fff200' });
    expect(ferrari?.pilotos).toEqual([]);
  });
});
