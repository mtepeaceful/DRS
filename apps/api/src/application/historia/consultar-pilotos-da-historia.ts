import { PilotoNaoEncontrado } from '../../domain/erros.js';
import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { CarreiraNaF1, FonteDaHistoria, PilotoDaF1 } from '../ports/fonte-da-historia.js';
import type { Enciclopedia, Verbete } from '../ports/fonte-das-equipes.js';
import { nomeComparavel } from '../pilotos/nome-comparavel.js';

export interface ResumoDoPilotoDaF1 extends PilotoDaF1 {
  titulos: number;
}

export interface FichaDoPilotoDaF1 extends PilotoDaF1, CarreiraNaF1 {
  anosDeTitulo: number[];
  verbete: Verbete | null;
}

export class ConsultarPilotosDaHistoria {
  constructor(
    private readonly fonte: FonteDaHistoria,
    private readonly campeoes: CampeoesRepository,
    private readonly enciclopedia: Enciclopedia,
  ) {}

  async listar(): Promise<ResumoDoPilotoDaF1[]> {
    const [pilotos, campeoes] = await Promise.all([
      this.fonte.listarPilotos(),
      this.campeoes.listar(),
    ]);
    const titulos = new Map<string, number>();

    for (const campeao of campeoes) {
      const chave = nomeComparavel(campeao.piloto);
      titulos.set(chave, (titulos.get(chave) ?? 0) + 1);
    }

    return pilotos
      .map((piloto) => ({ ...piloto, titulos: titulos.get(nomeComparavel(piloto.nome)) ?? 0 }))
      .toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async detalhar(id: string): Promise<FichaDoPilotoDaF1> {
    const piloto = (await this.fonte.listarPilotos()).find((candidato) => candidato.id === id);

    if (!piloto) {
      throw new PilotoNaoEncontrado();
    }

    const chave = nomeComparavel(piloto.nome);
    const [carreira, campeoes, verbete] = await Promise.all([
      this.fonte.buscarCarreira(id),
      this.campeoes.listar(),
      piloto.wikipedia
        ? this.enciclopedia.verbete(piloto.wikipedia).catch(() => null)
        : Promise.resolve(null),
    ]);

    return {
      ...piloto,
      ...carreira,
      anosDeTitulo: campeoes
        .filter((campeao) => nomeComparavel(campeao.piloto) === chave)
        .map((campeao) => campeao.ano)
        .toSorted((a, b) => a - b),
      verbete,
    };
  }
}
