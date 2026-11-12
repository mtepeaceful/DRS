import type { Campeao } from './fonte-de-dados-da-f1.js';

export interface ImportacaoRepository {
  listarCampeoes(): Promise<Campeao[]>;
  guardarCampeoes(campeoes: Campeao[]): Promise<void>;
  ultimaImportacao(): Promise<Date | null>;
  registrarImportacao(executadaEm: Date): Promise<void>;
}
