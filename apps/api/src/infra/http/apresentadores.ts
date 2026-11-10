import type { PaginaDePilotosDTO, PilotoDTO } from '@drs/contracts';
import type { Pagina } from '../../domain/pagina.js';
import type { Piloto } from '../../domain/piloto.js';

export function apresentarPiloto(piloto: Piloto): PilotoDTO {
  return {
    ...piloto,
    criadoEm: piloto.criadoEm.toISOString(),
    atualizadoEm: piloto.atualizadoEm.toISOString(),
  };
}

export function apresentarPaginaDePilotos(pagina: Pagina<Piloto>): PaginaDePilotosDTO {
  return { ...pagina, itens: pagina.itens.map(apresentarPiloto) };
}
