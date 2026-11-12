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

export interface Foto {
  url: string;
  pagina: string;
  autor: string | null;
  licenca: string | null;
}

export interface Verbete {
  resumo: string;
  fonte: string;
  foto: Foto | null;
  fundacao: number | null;
  fundadores: string[];
  sede: string | null;
}

export interface Enciclopedia {
  verbete(artigoEmIngles: string): Promise<Verbete | null>;
}
