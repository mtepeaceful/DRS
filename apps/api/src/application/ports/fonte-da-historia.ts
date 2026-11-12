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

export interface Carreira {
  nascimento: string | null;
  estreia: number;
  temporadas: number;
  corridas: number;
  vitorias: number;
  podios: number;
  poles: number;
}

export interface FonteDaHistoria {
  buscarCampeoes(anos: number[]): Promise<Campeao[]>;
  buscarTemporada(ano: number): Promise<TemporadaHistorica>;
  buscarCarreira(nome: string): Promise<Carreira | null>;
}
