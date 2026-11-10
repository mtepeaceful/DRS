import type { Equipe } from './equipe.js';

export interface Piloto {
  id: string;
  nome: string;
  numero: number;
  nacionalidade: string;
  titulos: number;
  equipe: Equipe;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface DadosPiloto {
  nome: string;
  numero: number;
  nacionalidade: string;
  equipeId: string;
  titulos: number;
}
