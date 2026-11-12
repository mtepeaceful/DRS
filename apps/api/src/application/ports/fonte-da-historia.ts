export interface Campeao {
  ano: number;
  sigla: string | null;
  piloto: string;
  pais: string | null;
  equipe: string;
  pontos: number;
  vitorias: number;
  construtor: { nome: string; pontos: number; vitorias: number } | null;
}

export interface CorridaHistorica {
  rodada: number;
  nome: string;
  circuito: string;
  circuitoId: string;
  pais: string;
  data: string;
  vencedor: { nome: string; equipe: string } | null;
}

export interface PilotoDaHistoria {
  posicao: number;
  nome: string;
  pais: string | null;
  equipes: string[];
  pontos: number;
  vitorias: number;
}

export interface ConstrutorDaHistoria {
  posicao: number;
  nome: string;
  pontos: number;
  vitorias: number;
}

export interface TemporadaHistorica {
  ano: number;
  corridas: CorridaHistorica[];
  pilotos: PilotoDaHistoria[];
  construtores: ConstrutorDaHistoria[];
}

export interface PilotoDaF1 {
  id: string;
  nome: string;
  pais: string | null;
  nascimento: string | null;
  wikipedia: string | null;
}

export interface CarreiraNaF1 {
  temporadas: number[];
  corridas: number;
  vitorias: number;
  podios: number;
  poles: number;
  equipes: { id: string; nome: string }[];
}

export interface FonteDaHistoria {
  buscarCampeoes(anos: number[]): Promise<Campeao[]>;
  buscarTemporada(ano: number): Promise<TemporadaHistorica>;
  listarPilotos(): Promise<PilotoDaF1[]>;
  buscarCarreira(id: string): Promise<CarreiraNaF1>;
}
