export interface Sessao {
  nome: string;
  inicio: Date;
}

export interface Corrida {
  rodada: number;
  nome: string;
  circuito: string;
  cidade: string;
  pais: string;
  inicio: Date;
  sessoes: Sessao[];
}

export interface PosicaoDePiloto {
  posicao: number;
  nome: string;
  equipe: string;
  pontos: number;
  vitorias: number;
}

export interface PosicaoDeConstrutor {
  posicao: number;
  nome: string;
  pontos: number;
  vitorias: number;
}

export interface ResultadoDeCorrida {
  rodada: number;
  nome: string;
  data: Date;
  podio: { posicao: number; nome: string; equipe: string }[];
}

export interface Campeonato {
  ano: number;
  totalDeRodadas: number;
  rodadasDisputadas: number;
  proximaCorrida: Corrida | null;
  pilotos: PosicaoDePiloto[];
  construtores: PosicaoDeConstrutor[];
  ultimaCorrida: ResultadoDeCorrida | null;
}

export interface Etapa extends Corrida {
  vencedor: { nome: string; equipe: string } | null;
}

export interface LinhaDoResultado {
  posicao: number;
  classificado: boolean;
  nome: string;
  numero: number;
  equipe: string;
  largada: number;
  voltas: number;
  tempo: string | null;
  situacao: string;
  pontos: number;
  voltaMaisRapida: boolean;
}

export interface LinhaDaQualificacao {
  posicao: number;
  nome: string;
  numero: number;
  equipe: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

export interface ResultadoDaEtapa {
  etapa: Corrida;
  classificacao: LinhaDoResultado[];
  sprint: LinhaDoResultado[];
  qualificacao: LinhaDaQualificacao[];
}

export interface Participacao {
  rodada: number;
  tipo: 'corrida' | 'sprint';
  nome: string;
  equipe: string;
  posicao: number;
  classificado: boolean;
  largada: number;
  pontos: number;
}

export interface FonteDoCampeonato {
  buscarCampeonato(agora: Date): Promise<Campeonato>;
  buscarCalendario(): Promise<Etapa[]>;
  buscarResultado(rodada: number): Promise<ResultadoDaEtapa | null>;
  buscarParticipacoes(): Promise<Participacao[]>;
}
