import type { Equipe } from './equipe.js';
import type { Foto } from './foto.js';

export interface Piloto {
  id: string;
  nome: string;
  numero: number;
  pais: string;
  titulos: number;
  equipe: Equipe;
  foto: Foto | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface DadosPiloto {
  nome: string;
  numero: number;
  pais: string;
  equipeId: string;
  titulos: number;
}
