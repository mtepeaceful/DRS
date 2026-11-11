import type { Equipe } from '../../domain/equipe.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';
import type { FonteDeDadosDaF1, PilotoDaTemporada } from '../ports/fonte-de-dados-da-f1.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

export interface PilotoIgnorado {
  nome: string;
  motivo: string;
}

export interface ResultadoDaImportacao {
  ano: number;
  equipes: { criadas: number; atualizadas: number };
  pilotos: { criados: number; atualizados: number; ignorados: PilotoIgnorado[] };
}

export class ImportarTemporada {
  constructor(
    private readonly pilotos: PilotoRepository,
    private readonly equipes: EquipeRepository,
    private readonly fonte: FonteDeDadosDaF1,
  ) {}

  async executar(): Promise<ResultadoDaImportacao> {
    const temporada = await this.fonte.buscarTemporadaAtual();
    const resultado: ResultadoDaImportacao = {
      ano: temporada.ano,
      equipes: { criadas: 0, atualizadas: 0 },
      pilotos: { criados: 0, atualizados: 0, ignorados: [] },
    };
    const equipesPorNome = new Map<string, Equipe>();

    for (const dados of temporada.equipes) {
      const existente = await this.equipes.buscarPorNome(dados.nome);
      const equipe = existente
        ? await this.equipes.atualizar(existente.id, { ...dados, nome: existente.nome })
        : await this.equipes.criar(dados);

      if (equipe) {
        equipesPorNome.set(dados.nome.toLowerCase(), equipe);
        resultado.equipes[existente ? 'atualizadas' : 'criadas']++;
      }
    }

    for (const piloto of temporada.pilotos) {
      const ignorado = await this.importarPiloto(piloto, equipesPorNome, resultado);

      if (ignorado) {
        resultado.pilotos.ignorados.push({ nome: piloto.nome, motivo: ignorado });
      }
    }

    return resultado;
  }

  private async importarPiloto(
    piloto: PilotoDaTemporada,
    equipesPorNome: Map<string, Equipe>,
    resultado: ResultadoDaImportacao,
  ) {
    const equipe = equipesPorNome.get(piloto.equipe.toLowerCase());

    if (!equipe) {
      return `a equipe ${piloto.equipe} não veio na importação`;
    }

    if (!piloto.pais) {
      return 'país de origem desconhecido';
    }

    const existente = await this.pilotos.buscarPorNome(piloto.nome);
    const donoDoNumero = await this.pilotos.buscarPorNumero(piloto.numero);

    if (donoDoNumero && donoDoNumero.id !== existente?.id) {
      return `o número ${piloto.numero} já pertence a ${donoDoNumero.nome}`;
    }

    const dados = {
      nome: piloto.nome,
      numero: piloto.numero,
      pais: piloto.pais,
      titulos: piloto.titulos,
      equipeId: equipe.id,
    };

    if (existente) {
      await this.pilotos.atualizar(existente.id, dados);
      resultado.pilotos.atualizados++;
    } else {
      await this.pilotos.criar(dados);
      resultado.pilotos.criados++;
    }

    return null;
  }
}
