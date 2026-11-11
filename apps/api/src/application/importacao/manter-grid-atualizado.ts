import type { ImportacaoRepository } from '../ports/importacao-repository.js';
import type { ImportarTemporada, ResultadoDaImportacao } from './importar-temporada.js';

const UM_DIA_EM_MS = 24 * 60 * 60_000;

export class ManterGridAtualizado {
  constructor(
    private readonly importar: ImportarTemporada,
    private readonly importacoes: ImportacaoRepository,
    private readonly validadeEmMs = UM_DIA_EM_MS,
  ) {}

  async executarSeNecessario(agora: Date): Promise<ResultadoDaImportacao | null> {
    const ultima = await this.importacoes.ultimaImportacao();

    if (ultima && agora.getTime() - ultima.getTime() < this.validadeEmMs) {
      return null;
    }

    return this.importar.executar();
  }
}
