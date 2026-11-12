export interface ImportacaoRepository {
  ultimaImportacao(): Promise<Date | null>;
  registrarImportacao(executadaEm: Date): Promise<void>;
}
