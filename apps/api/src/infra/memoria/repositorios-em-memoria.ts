import { randomUUID } from 'node:crypto';
import type { EquipeRepository } from '../../application/ports/equipe-repository.js';
import type {
  FiltroDePilotos,
  PilotoRepository,
} from '../../application/ports/piloto-repository.js';
import type { DadosEquipe, Equipe } from '../../domain/equipe.js';
import type { DadosPiloto, Piloto } from '../../domain/piloto.js';

export class EquipeRepositoryEmMemoria implements EquipeRepository {
  readonly equipes = new Map<string, Equipe>();

  async listar() {
    return [...this.equipes.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async buscarPorId(id: string) {
    return this.equipes.get(id) ?? null;
  }

  async buscarPorNome(nome: string) {
    const procurado = nome.toLowerCase();

    return [...this.equipes.values()].find((e) => e.nome.toLowerCase() === procurado) ?? null;
  }

  async criar(dados: DadosEquipe) {
    const equipe = { id: randomUUID(), ...dados };
    this.equipes.set(equipe.id, equipe);

    return equipe;
  }

  async atualizar(id: string, dados: DadosEquipe) {
    if (!this.equipes.has(id)) {
      return null;
    }

    const equipe = { id, ...dados };
    this.equipes.set(id, equipe);

    return equipe;
  }
}

export class PilotoRepositoryEmMemoria implements PilotoRepository {
  private readonly pilotos = new Map<string, Piloto>();

  constructor(private readonly equipes: EquipeRepositoryEmMemoria) {}

  async listar({ busca, pagina, porPagina }: FiltroDePilotos) {
    const termo = busca?.toLowerCase();
    const encontrados = [...this.pilotos.values()]
      .filter(
        (p) =>
          !termo ||
          p.nome.toLowerCase().includes(termo) ||
          p.equipe.nome.toLowerCase().includes(termo),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome));
    const inicio = (pagina - 1) * porPagina;

    return { itens: encontrados.slice(inicio, inicio + porPagina), total: encontrados.length };
  }

  async buscarPorId(id: string) {
    return this.pilotos.get(id) ?? null;
  }

  async buscarPorNumero(numero: number) {
    return [...this.pilotos.values()].find((p) => p.numero === numero) ?? null;
  }

  async buscarPorNome(nome: string) {
    const procurado = nome.toLowerCase();

    return [...this.pilotos.values()].find((p) => p.nome.toLowerCase() === procurado) ?? null;
  }

  async criar(dados: DadosPiloto) {
    const agora = new Date();
    const piloto = this.montar(randomUUID(), dados, agora, agora);
    this.pilotos.set(piloto.id, piloto);

    return piloto;
  }

  async atualizar(id: string, dados: DadosPiloto) {
    const atual = this.pilotos.get(id);

    if (!atual) {
      return null;
    }

    const piloto = this.montar(id, dados, atual.criadoEm, new Date());
    this.pilotos.set(id, piloto);

    return piloto;
  }

  async excluir(id: string) {
    return this.pilotos.delete(id);
  }

  private montar(id: string, dados: DadosPiloto, criadoEm: Date, atualizadoEm: Date): Piloto {
    const equipe = this.equipes.equipes.get(dados.equipeId);

    if (!equipe) {
      throw new Error(`Equipe ${dados.equipeId} não existe no repositório em memória`);
    }

    const { nome, numero, pais, titulos } = dados;

    return { id, nome, numero, pais, titulos, equipe, criadoEm, atualizadoEm };
  }
}
