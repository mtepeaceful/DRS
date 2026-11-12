export interface Circuito {
  id: string;
  nome: string;
  cidade: string;
  pais: string;
  latitude: number;
  longitude: number;
  wikipedia: string | null;
}

export interface VitoriaNoCircuito {
  ano: number;
  rodada: number;
  gp: string;
  piloto: string;
  equipe: string;
}

export interface FonteDosCircuitos {
  listar(): Promise<Circuito[]>;
  vencedores(id: string): Promise<VitoriaNoCircuito[]>;
}
