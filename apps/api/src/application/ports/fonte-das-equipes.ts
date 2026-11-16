import type { Foto } from '../../domain/foto.js';

export interface EquipeDaHistoria {
  id: string;
  nome: string;
  pais: string | null;
  wikipedia: string | null;
}

export interface NumerosDaEquipe {
  temporadas: number[];
  corridas: number;
  vitorias: number;
  podios: number;
  poles: number;
}

export interface FonteDasEquipes {
  listar(): Promise<EquipeDaHistoria[]>;
  numeros(id: string): Promise<NumerosDaEquipe>;
}

export type { Foto };

export interface Verbete {
  resumo: string;
  fonte: string;
  foto: Foto | null;
  fundacao: number | null;
  fundadores: string[];
  sede: string | null;
}

export interface GaleriaDeFotos {
  foto(artigoEmIngles: string): Promise<Foto | null>;
}

export interface Enciclopedia {
  verbete(artigoEmIngles: string): Promise<Verbete | null>;
}
