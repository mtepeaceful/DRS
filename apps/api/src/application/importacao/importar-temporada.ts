import type { Equipe } from '../../domain/equipe.js';
import type { EquipeRepository } from '../ports/equipe-repository.js';
import type { FonteDeDadosDaF1, PilotoDaTemporada } from '../ports/fonte-de-dados-da-f1.js';
import type { ImportacaoRepository } from '../ports/importacao-repository.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';

const TEMPORADAS_PARA_CONTAR_TITULOS = 30;

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
    private readonly importacoes: ImportacaoRepository,
    private readonly fonte: FonteDeDadosDaF1,
    private readonly agora: () => Date = () => new Date(),
  ) {}

  private emAndamento: Promise<ResultadoDaImportacao> | null = null;

  executar(): Promise<ResultadoDaImportacao> {
    this.emAndamento ??= this.importar().finally(() => {
      this.emAndamento = null;
    });

    return this.emAndamento;
  }

  private async importar(): Promise<ResultadoDaImportacao> {
    const temporada = await this.fonte.buscarTemporadaAtual();
    const titulos = await this.contarTitulos(temporada.ano);
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
      const ignorado = await this.importarPiloto(
        piloto,
        titulos.get(piloto.sigla) ?? 0,
        equipesPorNome,
        resultado,
      );

      if (ignorado) {
        resultado.pilotos.ignorados.push({ nome: piloto.nome, motivo: ignorado });
      }
    }

    await this.importacoes.registrarImportacao(this.agora());

    return resultado;
  }

  private async contarTitulos(anoAtual: number) {
    const anos = Array.from(
      { length: TEMPORADAS_PARA_CONTAR_TITULOS },
      (_, i) => anoAtual - TEMPORADAS_PARA_CONTAR_TITULOS + i,
    );
    const campeaoPorAno = new Map(
      (await this.importacoes.listarCampeoes()).map(({ ano, sigla }) => [ano, sigla]),
    );
    const faltando = anos.filter((ano) => !campeaoPorAno.has(ano));

    if (faltando.length > 0) {
      const novos = await this.fonte.buscarCampeoes(faltando);
      await this.importacoes.guardarCampeoes(novos);

      for (const { ano, sigla } of novos) {
        campeaoPorAno.set(ano, sigla);
      }
    }

    const titulos = new Map<string, number>();

    for (const ano of anos) {
      const sigla = campeaoPorAno.get(ano);

      if (sigla) {
        titulos.set(sigla, (titulos.get(sigla) ?? 0) + 1);
      }
    }

    return titulos;
  }

  private async importarPiloto(
    piloto: PilotoDaTemporada,
    titulos: number,
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
      titulos,
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
