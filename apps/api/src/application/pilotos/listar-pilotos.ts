import type { Pagina } from '../../domain/pagina.js';
import type { Piloto } from '../../domain/piloto.js';
import type { FiltroDePilotos, PilotoRepository } from '../ports/piloto-repository.js';

export class ListarPilotos {
  constructor(private readonly pilotos: PilotoRepository) {}

  async executar(filtro: FiltroDePilotos): Promise<Pagina<Piloto>> {
    const busca = filtro.busca?.trim() || undefined;
    const { itens, total } = await this.pilotos.listar({ ...filtro, busca });

    return { itens, total, pagina: filtro.pagina, porPagina: filtro.porPagina };
  }
}
