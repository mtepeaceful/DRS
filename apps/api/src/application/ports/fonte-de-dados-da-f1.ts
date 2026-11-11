import type { DadosEquipe } from '../../domain/equipe.js';

export interface PilotoDaTemporada {
  nome: string;
  numero: number;
  pais: string | null;
  titulos: number;
  equipe: string;
}

export interface Temporada {
  ano: number;
  equipes: DadosEquipe[];
  pilotos: PilotoDaTemporada[];
}

export interface FonteDeDadosDaF1 {
  buscarTemporadaAtual(): Promise<Temporada>;
}
