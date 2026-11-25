import { idiomaAtual } from '../../shared/i18n/idioma';
import type { Ponto } from '../garagem/cena';

export interface Peca {
  id: string;
  nome: string;
  ponto: Ponto;
  texto: string;
  termos: string[];
}

export const PECAS: Peca[] = [
  {
    id: 'asa-dianteira',
    nome: 'Asa dianteira',
    ponto: [2.6, 0.16, 0.8],
    texto:
      'É a primeira peça a encontrar o ar. Gera pressão na frente do carro e guia o fluxo em volta das rodas e para baixo do assoalho. Em 2026 ganhou flaps que mudam de posição entre curvas e retas.',
    termos: ['downforce', 'aerodinamica-ativa'],
  },
  {
    id: 'pneus',
    nome: 'Pneus',
    ponto: [1.85, 0.36, 1.08],
    texto:
      'O único contato do carro com o chão. A Pirelli leva compostos de pista seca, do mais duro ao mais macio, e dois de chuva. Desde 2022 as rodas têm 18 polegadas.',
    termos: ['compostos', 'pneus-de-chuva', 'degradacao'],
  },
  {
    id: 'assoalho',
    nome: 'Assoalho',
    ponto: [0.8, 0.12, 0.78],
    texto:
      'Desde 2022 é a peça mais importante da aerodinâmica. Os túneis embaixo do carro aceleram o ar e sugam o carro contra a pista, gerando pressão sem o arrasto de uma asa grande.',
    termos: ['efeito-solo', 'porpoising'],
  },
  {
    id: 'volante',
    nome: 'Volante',
    ponto: [0.55, 0.5, 0.32],
    texto:
      'Mais computador do que volante: dezenas de botões e seletores para o equilíbrio de freio, o diferencial, os modos de energia e o rádio. Sai do carro para o piloto entrar e sair do cockpit.',
    termos: ['ers'],
  },
  {
    id: 'halo',
    nome: 'Halo',
    ponto: [-0.05, 0.98, 0],
    texto:
      'Arco de titânio sobre a cabeça do piloto, obrigatório desde 2018. Aguenta cargas de mais de 12 toneladas e já evitou ferimentos graves em vários acidentes.',
    termos: ['halo'],
  },
  {
    id: 'sidepods',
    nome: 'Sidepods',
    ponto: [-0.45, 0.56, 0.8],
    texto:
      'As laterais guardam os radiadores do motor e da parte elétrica. O formato muda muito de equipe para equipe, porque decide como o ar chega à traseira do carro.',
    termos: [],
  },
  {
    id: 'unidade-de-potencia',
    nome: 'Unidade de potência',
    ponto: [-1.2, 0.85, 0],
    texto:
      'Fica atrás do piloto: um V6 turbo de 1,6 litro trabalhando junto com um motor elétrico que recupera energia nas frenagens. Em 2026 a parte elétrica passou a responder por quase metade da potência.',
    termos: ['unidade-de-potencia', 'ers'],
  },
  {
    id: 'asa-traseira',
    nome: 'Asa traseira',
    ponto: [-2.38, 1, 0.5],
    texto:
      'Dá pressão à traseira para o carro não escapar nas curvas. De 2011 a 2025 tinha o DRS, que abria o flap nas retas só para quem atacava. Em 2026 a asa passou a abrir nas retas para todos os carros.',
    termos: ['drs', 'aerodinamica-ativa'],
  },
  {
    id: 'difusor',
    nome: 'Difusor',
    ponto: [-2.5, 0.25, 0.45],
    texto:
      'A saída dos túneis do assoalho, embaixo da traseira. Ao abrir espaço para o ar se expandir, ajuda a sugar o carro contra o chão.',
    termos: ['downforce', 'efeito-solo'],
  },
];

const EN: Record<string, Pick<Peca, 'nome' | 'texto'>> = {
  'asa-dianteira': {
    nome: 'Front wing',
    texto:
      'The first part to meet the air. It makes downforce at the front and guides the flow around the wheels and under the floor. In 2026 it gained flaps that change position between corners and straights.',
  },
  pneus: {
    nome: 'Tyres',
    texto:
      'The car’s only contact with the ground. Pirelli brings dry compounds, from the hardest to the softest, and two wet ones. Since 2022 the wheels are 18 inches.',
  },
  assoalho: {
    nome: 'Floor',
    texto:
      'Since 2022 it is the most important aerodynamic part. The tunnels under the car speed up the air and suck the car onto the track, making downforce without the drag of a big wing.',
  },
  volante: {
    nome: 'Steering wheel',
    texto:
      'More computer than wheel: dozens of buttons and dials for brake balance, the differential, energy modes and the radio. It comes off so the driver can get in and out of the cockpit.',
  },
  halo: {
    nome: 'Halo',
    texto:
      'A titanium hoop over the driver’s head, mandatory since 2018. It withstands loads of more than 12 tonnes and has already prevented serious injuries in several crashes.',
  },
  sidepods: {
    nome: 'Sidepods',
    texto:
      'The sides hold the radiators for the engine and the electric system. Their shape varies a lot from team to team, because it decides how the air reaches the back of the car.',
  },
  'unidade-de-potencia': {
    nome: 'Power unit',
    texto:
      'It sits behind the driver: a 1.6-litre turbo V6 working with an electric motor that recovers energy under braking. In 2026 the electric side came to provide almost half the power.',
  },
  'asa-traseira': {
    nome: 'Rear wing',
    texto:
      'It gives the rear downforce so the car does not slide in corners. From 2011 to 2025 it had DRS, which opened the flap on straights only for the attacking car. In 2026 the wing began opening on straights for every car.',
  },
  difusor: {
    nome: 'Diffuser',
    texto:
      'The exit of the floor tunnels, under the rear. By giving the air room to expand, it helps suck the car onto the ground.',
  },
};

const PECAS_EN: Peca[] = PECAS.map((peca) => ({ ...peca, ...EN[peca.id] }));

export function pecasNoIdioma(): Peca[] {
  return idiomaAtual() === 'en' ? PECAS_EN : PECAS;
}
