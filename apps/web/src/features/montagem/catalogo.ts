import type { Composto, VariacaoDeAsa, VariacaoDeAssoalho } from '../garagem/cena';

export type Nivel = 1 | 2 | 3;

export interface EquipeDaGaragem {
  id: string;
  nome: string;
  cor: string;
  corSecundaria: string;
  tecnologia: Nivel;
  motor: { proprio: boolean; fabricante: string };
}

export type Atributo = 'reta' | 'curva' | 'tracao' | 'confiabilidade';

export type IdDaCategoria =
  'asa-dianteira' | 'asa-traseira' | 'assoalho' | 'motor' | 'suspensao' | 'pneus' | 'patrocinio';

export interface Peca {
  id: string;
  nome: string;
  descricao: string;
  nivel: Nivel;
  custo: number;
  efeito: Partial<Record<Atributo, number>>;
  apenasMotorProprio?: boolean;
  verba?: number;
  visual?: VariacaoDeAsa | VariacaoDeAssoalho | Composto;
}

export interface Categoria {
  id: IdDaCategoria;
  nome: string;
  pecas: readonly Peca[];
}

export type Montagem = Record<IdDaCategoria, string>;

export const TETO_DE_GASTOS = 10;

export const ATRIBUTOS: readonly { id: Atributo; nome: string }[] = [
  { id: 'reta', nome: 'Velocidade de reta' },
  { id: 'curva', nome: 'Curvas' },
  { id: 'tracao', nome: 'Tração' },
  { id: 'confiabilidade', nome: 'Confiabilidade' },
];

export const EQUIPES: readonly EquipeDaGaragem[] = [
  {
    id: 'mclaren',
    nome: 'McLaren',
    cor: '#ff8000',
    corSecundaria: '#111114',
    tecnologia: 3,
    motor: { proprio: false, fabricante: 'Mercedes' },
  },
  {
    id: 'mercedes',
    nome: 'Mercedes',
    cor: '#c8ccce',
    corSecundaria: '#00a19c',
    tecnologia: 3,
    motor: { proprio: true, fabricante: 'Mercedes' },
  },
  {
    id: 'ferrari',
    nome: 'Ferrari',
    cor: '#dc0000',
    corSecundaria: '#fff200',
    tecnologia: 3,
    motor: { proprio: true, fabricante: 'Ferrari' },
  },
  {
    id: 'red-bull-racing',
    nome: 'Red Bull Racing',
    cor: '#1e41ff',
    corSecundaria: '#ffcc00',
    tecnologia: 3,
    motor: { proprio: true, fabricante: 'Red Bull Ford' },
  },
  {
    id: 'williams',
    nome: 'Williams',
    cor: '#0a2a6b',
    corSecundaria: '#00a0de',
    tecnologia: 2,
    motor: { proprio: false, fabricante: 'Mercedes' },
  },
  {
    id: 'aston-martin',
    nome: 'Aston Martin',
    cor: '#006f62',
    corSecundaria: '#cedc00',
    tecnologia: 2,
    motor: { proprio: true, fabricante: 'Honda, em parceria de fábrica' },
  },
  {
    id: 'racing-bulls',
    nome: 'Racing Bulls',
    cor: '#6692ff',
    corSecundaria: '#ffffff',
    tecnologia: 2,
    motor: { proprio: false, fabricante: 'Red Bull Ford' },
  },
  {
    id: 'alpine',
    nome: 'Alpine',
    cor: '#0090ff',
    corSecundaria: '#ff87bc',
    tecnologia: 2,
    motor: { proprio: false, fabricante: 'Mercedes' },
  },
  {
    id: 'haas',
    nome: 'Haas F1 Team',
    cor: '#f4f4f5',
    corSecundaria: '#e6002b',
    tecnologia: 2,
    motor: { proprio: false, fabricante: 'Ferrari' },
  },
  {
    id: 'audi',
    nome: 'Audi',
    cor: '#b5b8bd',
    corSecundaria: '#f50537',
    tecnologia: 2,
    motor: { proprio: true, fabricante: 'Audi' },
  },
  {
    id: 'cadillac',
    nome: 'Cadillac',
    cor: '#1b1b1f',
    corSecundaria: '#d9d9d9',
    tecnologia: 1,
    motor: { proprio: false, fabricante: 'Ferrari' },
  },
];

export const CATEGORIAS: readonly Categoria[] = [
  {
    id: 'asa-dianteira',
    nome: 'Asa dianteira',
    pecas: [
      {
        id: 'padrao',
        nome: 'Padrão',
        descricao: 'O desenho do início da temporada, equilibrado.',
        nivel: 1,
        custo: 0,
        efeito: {},
        visual: 'padrao',
      },
      {
        id: 'carga',
        nome: 'Alta carga',
        descricao: 'Dois elementos que seguram a frente nas curvas lentas.',
        nivel: 1,
        custo: 2,
        efeito: { curva: 6, reta: -3 },
        visual: 'carga',
      },
      {
        id: 'arrasto',
        nome: 'Baixo arrasto',
        descricao: 'Mais fina, para as pistas de reta longa.',
        nivel: 2,
        custo: 3,
        efeito: { reta: 5, curva: -2 },
        visual: 'arrasto',
      },
      {
        id: 'evolucao',
        nome: 'Evolução de três elementos',
        descricao: 'Mais carga quase sem perder velocidade. Pede túnel de vento de ponta.',
        nivel: 3,
        custo: 5,
        efeito: { curva: 8, reta: 1 },
        visual: 'evolucao',
      },
    ],
  },
  {
    id: 'asa-traseira',
    nome: 'Asa traseira',
    pecas: [
      {
        id: 'padrao',
        nome: 'Padrão',
        descricao: 'Carga média, serve para quase todas as pistas.',
        nivel: 1,
        custo: 0,
        efeito: {},
        visual: 'padrao',
      },
      {
        id: 'arrasto',
        nome: 'Baixa carga',
        descricao: 'Perfil raso para circuitos de alta velocidade.',
        nivel: 1,
        custo: 2,
        efeito: { reta: 7, curva: -5 },
        visual: 'arrasto',
      },
      {
        id: 'carga',
        nome: 'Alta carga',
        descricao: 'Perfil fundo para pistas travadas e de rua.',
        nivel: 1,
        custo: 2,
        efeito: { curva: 7, reta: -6 },
        visual: 'carga',
      },
      {
        id: 'evolucao',
        nome: 'Perfil duplo',
        descricao: 'Um segundo plano mais baixo ajuda o difusor a puxar o ar.',
        nivel: 3,
        custo: 5,
        efeito: { curva: 5, reta: 4 },
        visual: 'evolucao',
      },
    ],
  },
  {
    id: 'assoalho',
    nome: 'Assoalho',
    pecas: [
      {
        id: 'padrao',
        nome: 'Padrão',
        descricao: 'Canais por baixo do carro no desenho original.',
        nivel: 1,
        custo: 0,
        efeito: {},
        visual: 'padrao',
      },
      {
        id: 'canais',
        nome: 'Canais revisados',
        descricao: 'Mais efeito solo com aletas extras na entrada do assoalho.',
        nivel: 2,
        custo: 3,
        efeito: { curva: 6, tracao: 2 },
        visual: 'canais',
      },
      {
        id: 'borda',
        nome: 'Borda esculpida',
        descricao: 'Sela o ar por baixo do carro, mas é sensível a zebras.',
        nivel: 3,
        custo: 5,
        efeito: { curva: 9, confiabilidade: -3 },
        visual: 'borda',
      },
    ],
  },
  {
    id: 'motor',
    nome: 'Unidade de potência',
    pecas: [
      {
        id: 'padrao',
        nome: 'Especificação base',
        descricao: 'O motor homologado no começo do ano.',
        nivel: 1,
        custo: 0,
        efeito: {},
      },
      {
        id: 'durabilidade',
        nome: 'Pacote de durabilidade',
        descricao: 'Menos potência, menos chance de quebrar.',
        nivel: 1,
        custo: 2,
        efeito: { confiabilidade: 8, reta: -2 },
      },
      {
        id: 'mapa',
        nome: 'Mapa de energia agressivo',
        descricao: 'Usa mais a bateria nas retas, com mais desgaste.',
        nivel: 2,
        custo: 3,
        efeito: { reta: 6, confiabilidade: -6 },
      },
      {
        id: 'evolucao',
        nome: 'Atualização de fábrica',
        descricao: 'Peças novas no motor, entregues primeiro à equipe que o fabrica.',
        nivel: 2,
        custo: 5,
        efeito: { reta: 8, confiabilidade: 2 },
        apenasMotorProprio: true,
      },
    ],
  },
  {
    id: 'suspensao',
    nome: 'Suspensão',
    pecas: [
      {
        id: 'padrao',
        nome: 'Push-rod padrão',
        descricao: 'Fácil de acertar e de consertar.',
        nivel: 1,
        custo: 0,
        efeito: {},
      },
      {
        id: 'macia',
        nome: 'Acerto macio',
        descricao: 'Passa melhor pelas zebras e pelas ondulações.',
        nivel: 1,
        custo: 1,
        efeito: { tracao: 4, curva: -2 },
      },
      {
        id: 'pull-rod',
        nome: 'Pull-rod na traseira',
        descricao: 'Peso mais baixo e mais espaço para o ar chegar ao difusor.',
        nivel: 2,
        custo: 3,
        efeito: { tracao: 6, curva: 2 },
      },
      {
        id: 'anti-mergulho',
        nome: 'Geometria anti-mergulho',
        descricao: 'O carro mantém a altura na frenagem e o assoalho trabalha melhor.',
        nivel: 3,
        custo: 4,
        efeito: { curva: 4, tracao: 4 },
      },
    ],
  },
  {
    id: 'pneus',
    nome: 'Pneus',
    pecas: [
      {
        id: 'medio',
        nome: 'Médio',
        descricao: 'Faixa amarela. O meio-termo entre aderência e duração.',
        nivel: 1,
        custo: 0,
        efeito: {},
        visual: 'medio',
      },
      {
        id: 'macio',
        nome: 'Macio',
        descricao: 'Faixa vermelha. Mais aderência, gasta rápido.',
        nivel: 1,
        custo: 0,
        efeito: { curva: 6, tracao: 6, confiabilidade: -8 },
        visual: 'macio',
      },
      {
        id: 'duro',
        nome: 'Duro',
        descricao: 'Faixa branca. Dura a corrida toda, com menos aderência.',
        nivel: 1,
        custo: 0,
        efeito: { curva: -4, tracao: -3, confiabilidade: 7 },
        visual: 'duro',
      },
    ],
  },
  {
    id: 'patrocinio',
    nome: 'Patrocinador',
    pecas: [
      {
        id: 'nenhum',
        nome: 'Sem patrocinador',
        descricao: 'Carro limpo, só com as cores da equipe.',
        nivel: 1,
        custo: 0,
        efeito: {},
      },
      {
        id: 'box-box-cafe',
        nome: 'Box Box Café',
        descricao: 'Cafeteria de bairro que aposta em qualquer equipe.',
        nivel: 1,
        custo: 0,
        verba: 1,
        efeito: {},
      },
      {
        id: 'zebra-telecom',
        nome: 'Zebra Telecom',
        descricao: 'Operadora em expansão, quer aparecer no meio do grid.',
        nivel: 2,
        custo: 0,
        verba: 2,
        efeito: {},
      },
      {
        id: 'apice-bank',
        nome: 'Ápice Bank',
        descricao: 'Banco grande, só assina com quem briga por vitória.',
        nivel: 3,
        custo: 0,
        verba: 3,
        efeito: {},
      },
    ],
  },
];

export const BASE_POR_NIVEL: Record<Nivel, number> = { 1: 52, 2: 60, 3: 68 };

const CATEGORIA_POR_ID = new Map(CATEGORIAS.map((categoria) => [categoria.id, categoria]));

export function categoria(id: IdDaCategoria) {
  const encontrada = CATEGORIA_POR_ID.get(id);

  if (!encontrada) {
    throw new Error(`Categoria desconhecida: ${id}`);
  }

  return encontrada;
}

function pecaPadrao({ id, pecas }: Categoria) {
  const [primeira] = pecas;

  if (!primeira) {
    throw new Error(`Categoria sem peças: ${id}`);
  }

  return primeira;
}

export function pecaDaMontagem(montagem: Montagem, id: IdDaCategoria) {
  const escolhida = categoria(id);

  return escolhida.pecas.find((peca) => peca.id === montagem[id]) ?? pecaPadrao(escolhida);
}

export function montagemPadrao(): Montagem {
  return Object.fromEntries(CATEGORIAS.map((item) => [item.id, pecaPadrao(item).id])) as Montagem;
}

export function equipePorId(id: string | null) {
  return EQUIPES.find((equipe) => equipe.id === id) ?? null;
}

export function orcamento(montagem: Montagem) {
  let teto = TETO_DE_GASTOS;
  let gasto = 0;

  for (const { id } of CATEGORIAS) {
    const peca = pecaDaMontagem(montagem, id);
    teto += peca.verba ?? 0;
    gasto += peca.custo;
  }

  return { teto, gasto, sobra: teto - gasto };
}

export type Disponibilidade = { liberada: true } | { liberada: false; motivo: string };

export function disponibilidade(
  equipe: EquipeDaGaragem,
  montagem: Montagem,
  idDaCategoria: IdDaCategoria,
  peca: Peca,
): Disponibilidade {
  if (peca.apenasMotorProprio && !equipe.motor.proprio) {
    return {
      liberada: false,
      motivo: `Só para quem fabrica o motor. A ${equipe.nome} usa motor ${equipe.motor.fabricante}.`,
    };
  }

  if (peca.nivel > equipe.tecnologia) {
    return {
      liberada: false,
      motivo:
        idDaCategoria === 'patrocinio'
          ? `Só assina com equipes de nível ${peca.nivel}.`
          : `Fora da tecnologia da ${equipe.nome} (pede nível ${peca.nivel}).`,
    };
  }

  const comEstaPeca = orcamento({ ...montagem, [idDaCategoria]: peca.id });

  if (comEstaPeca.sobra < 0) {
    return {
      liberada: false,
      motivo: `Estoura o teto de gastos em US$ ${-comEstaPeca.sobra} mi.`,
    };
  }

  return { liberada: true };
}

export function atributos(equipe: EquipeDaGaragem, montagem: Montagem) {
  const base = BASE_POR_NIVEL[equipe.tecnologia];
  const valores = Object.fromEntries(ATRIBUTOS.map(({ id }) => [id, base])) as Record<
    Atributo,
    number
  >;

  if (equipe.motor.proprio) {
    valores.confiabilidade += 3;
  }

  for (const { id } of CATEGORIAS) {
    for (const [atributo, delta] of Object.entries(pecaDaMontagem(montagem, id).efeito)) {
      valores[atributo as Atributo] += delta;
    }
  }

  for (const { id } of ATRIBUTOS) {
    valores[id] = Math.min(100, Math.max(0, valores[id]));
  }

  return valores;
}

/**
 * Lê a montagem do endereço e devolve só o que a equipe pode usar:
 * peça desconhecida ou bloqueada volta para a padrão.
 */
export function montagemValida(equipe: EquipeDaGaragem, pedida: Partial<Montagem>): Montagem {
  const montagem = montagemPadrao();
  const ordem: IdDaCategoria[] = [
    'patrocinio',
    ...CATEGORIAS.map((item) => item.id).filter((id) => id !== 'patrocinio'),
  ];

  for (const id of ordem) {
    const peca = categoria(id).pecas.find((candidata) => candidata.id === pedida[id]);

    if (peca && disponibilidade(equipe, montagem, id, peca).liberada) {
      montagem[id] = peca.id;
    }
  }

  return montagem;
}

export function paraParametros(equipe: EquipeDaGaragem, montagem: Montagem) {
  const padrao = montagemPadrao();
  const parametros = new URLSearchParams({ equipe: equipe.id });

  for (const { id } of CATEGORIAS) {
    if (montagem[id] !== padrao[id]) {
      parametros.set(id, montagem[id]);
    }
  }

  return parametros;
}

export function deParametros(parametros: URLSearchParams) {
  const equipe = equipePorId(parametros.get('equipe'));

  if (!equipe) {
    return null;
  }

  const pedida: Partial<Montagem> = {};

  for (const { id } of CATEGORIAS) {
    const valor = parametros.get(id);

    if (valor) {
      pedida[id] = valor;
    }
  }

  return { equipe, montagem: montagemValida(equipe, pedida) };
}
