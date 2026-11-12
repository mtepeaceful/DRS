import type { Campeao } from './fonte-da-historia.js';

export interface CampeoesRepository {
  listar(): Promise<Campeao[]>;
  guardar(campeoes: Campeao[]): Promise<void>;
}
