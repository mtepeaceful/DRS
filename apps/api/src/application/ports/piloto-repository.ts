import type { DadosPiloto, Piloto } from '../../domain/piloto.js';

export interface FiltroDePilotos {
  busca?: string | undefined;
  pagina: number;
  porPagina: number;
}

export interface PilotoRepository {
  listar(filtro: FiltroDePilotos): Promise<{ itens: Piloto[]; total: number }>;
  buscarPorId(id: string): Promise<Piloto | null>;
  buscarPorNumero(numero: number): Promise<Piloto | null>;
  buscarPorNome(nome: string): Promise<Piloto | null>;
  criar(dados: DadosPiloto): Promise<Piloto>;
  atualizar(id: string, dados: DadosPiloto): Promise<Piloto | null>;
  excluir(id: string): Promise<boolean>;
}
