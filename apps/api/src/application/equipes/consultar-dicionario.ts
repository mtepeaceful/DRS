import { EquipeNaoEncontrada } from '../../domain/erros.js';
import type { CampeoesRepository } from '../ports/campeoes-repository.js';
import type { Campeao } from '../ports/fonte-da-historia.js';
import type {
  Enciclopedia,
  EquipeDaHistoria,
  FonteDasEquipes,
  NumerosDaEquipe,
  Verbete,
} from '../ports/fonte-das-equipes.js';
import type { FonteDoCampeonato } from '../ports/fonte-do-campeonato.js';
import { PERFIS_DO_GRID, type PerfilDaEquipe } from './perfis-do-grid.js';

export interface ResumoDaEquipe extends EquipeDaHistoria {
  titulosDeConstrutores: number;
  titulosDePilotos: number;
  noGridAtual: boolean;
}

export interface TituloDePiloto {
  ano: number;
  piloto: string;
}

export interface FichaDaEquipe extends ResumoDaEquipe, NumerosDaEquipe {
  anosDeTitulo: number[];
  campeoesDePilotos: TituloDePiloto[];
  verbete: Verbete | null;
  perfil: PerfilDaEquipe | null;
  temporadaAtual: {
    posicao: number;
    pontos: number;
    pilotos: { nome: string; pontos: number }[];
  } | null;
}

export class ConsultarDicionario {
  constructor(
    private readonly equipes: FonteDasEquipes,
    private readonly enciclopedia: Enciclopedia,
    private readonly campeoes: CampeoesRepository,
    private readonly campeonato: FonteDoCampeonato,
  ) {}

  async listar(agora: Date): Promise<ResumoDaEquipe[]> {
    const [equipes, campeoes, gridAtual] = await Promise.all([
      this.todasAsEquipes(agora),
      this.campeoes.listar(),
      this.equipesDoGridAtual(agora),
    ]);

    return equipes
      .map((equipe) => this.resumir(equipe, campeoes, gridAtual))
      .toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async detalhar(id: string, agora: Date): Promise<FichaDaEquipe> {
    const equipe = (await this.todasAsEquipes(agora)).find((candidata) => candidata.id === id);

    if (!equipe) {
      throw new EquipeNaoEncontrada();
    }

    const [numeros, verbete, campeoes, campeonato] = await Promise.all([
      this.equipes.numeros(id),
      equipe.wikipedia
        ? this.enciclopedia.verbete(equipe.wikipedia).catch(() => null)
        : Promise.resolve(null),
      this.campeoes.listar(),
      this.campeonato.buscarCampeonato(agora).catch(() => null),
    ]);
    const naClassificacao = campeonato?.construtores.find((linha) => linha.nome === equipe.nome);

    return {
      ...this.resumir(equipe, campeoes, new Set(campeonato?.construtores.map((c) => c.nome))),
      ...numeros,
      verbete,
      perfil: PERFIS_DO_GRID[id] ?? null,
      anosDeTitulo: campeoes
        .filter((campeao) => campeao.construtor?.nome === equipe.nome)
        .map((campeao) => campeao.ano)
        .toSorted((a, b) => a - b),
      campeoesDePilotos: campeoes
        .filter((campeao) => campeao.equipe === equipe.nome)
        .map(({ ano, piloto }) => ({ ano, piloto }))
        .toSorted((a, b) => a.ano - b.ano),
      temporadaAtual:
        campeonato && naClassificacao
          ? {
              posicao: naClassificacao.posicao,
              pontos: naClassificacao.pontos,
              pilotos: campeonato.pilotos
                .filter((piloto) => piloto.equipe === equipe.nome)
                .map(({ nome, pontos }) => ({ nome, pontos })),
            }
          : null,
    };
  }

  /**
   * A lista completa vem da Jolpica, que às vezes não responde (ou limita as
   * chamadas). Nesse caso, as equipes do campeonato atual seguram a página:
   * a classificação traz o mesmo `constructorId` usado na rota /equipes/:id.
   */
  private async todasAsEquipes(agora: Date): Promise<EquipeDaHistoria[]> {
    try {
      return await this.equipes.listar();
    } catch (erro) {
      const campeonato = await this.campeonato.buscarCampeonato(agora).catch(() => null);
      const doGrid = (campeonato?.construtores ?? []).flatMap((construtor) =>
        construtor.id
          ? [{ id: construtor.id, nome: construtor.nome, pais: null, wikipedia: null }]
          : [],
      );

      if (doGrid.length === 0) {
        throw erro;
      }

      return doGrid;
    }
  }

  private async equipesDoGridAtual(agora: Date) {
    const campeonato = await this.campeonato.buscarCampeonato(agora).catch(() => null);

    return new Set(campeonato?.construtores.map((construtor) => construtor.nome));
  }

  private resumir(
    equipe: EquipeDaHistoria,
    campeoes: Campeao[],
    gridAtual: Set<string>,
  ): ResumoDaEquipe {
    return {
      ...equipe,
      titulosDeConstrutores: campeoes.filter((c) => c.construtor?.nome === equipe.nome).length,
      titulosDePilotos: campeoes.filter((c) => c.equipe === equipe.nome).length,
      noGridAtual: gridAtual.has(equipe.nome),
    };
  }
}
