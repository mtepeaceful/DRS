import type { DadosEquipe } from '../../domain/equipe.js';

export interface PilotoDaTemporada {
  nome: string;
  sigla: string;
  numero: number;
  pais: string | null;
  equipe: string;
}

export interface Temporada {
  ano: number;
  equipes: DadosEquipe[];
  pilotos: PilotoDaTemporada[];
}

export interface Campeao {
  ano: number;
  sigla: string | null;
}

export interface FonteDeDadosDaF1 {
  buscarTemporadaAtual(): Promise<Temporada>;
  buscarCampeoes(anos: number[]): Promise<Campeao[]>;
}
