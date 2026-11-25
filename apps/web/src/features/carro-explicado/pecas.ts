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
    id: 'nariz',
    nome: 'Nariz',
    ponto: [2.15, 0.3, 0],
    texto:
      'A ponta do carro guarda a estrutura que absorve as batidas de frente. Em 2026 ela passou a trabalhar em dois estágios, para proteger também numa segunda pancada. Cada equipe escolhe a altura e a largura: um nariz alto deixa mais ar passar por baixo rumo ao assoalho.',
    termos: [],
  },
  {
    id: 'suspensao',
    nome: 'Suspensão',
    ponto: [1.7, 0.44, 0.5],
    texto:
      'Braços de fibra de carbono ligam as rodas ao carro e também guiam o ar. A mola pode ser acionada por uma barra que empurra (pushrod) ou que puxa (pullrod). Em 2026 quase todos usam pushrod na frente; Alpine, Williams e Cadillac ficaram com pullrod.',
    termos: [],
  },
  {
    id: 'aletas-do-assoalho',
    nome: 'Aletas do assoalho',
    ponto: [1.2, 0.2, 0.82],
    texto:
      'Placas na frente do assoalho, logo atrás das rodas dianteiras. Voltaram em 2026, com até três elementos, e precisam empurrar o ar para dentro em vez de jogá-lo para fora. É onde os carros mais diferem entre si.',
    termos: ['ar-sujo', 'downforce'],
  },
  {
    id: 'pneus',
    nome: 'Pneus',
    ponto: [1.85, 0.36, 1.08],
    texto:
      'O único contato do carro com o chão. A Pirelli leva compostos de pista seca, do mais duro ao mais macio, e dois de chuva. As rodas têm 18 polegadas desde 2022, e em 2026 os pneus ficaram mais estreitos: 25 mm a menos na frente e 30 mm atrás.',
    termos: ['compostos', 'pneus-de-chuva', 'degradacao'],
  },
  {
    id: 'assoalho',
    nome: 'Assoalho',
    ponto: [0.8, 0.12, 0.78],
    texto:
      'Uma das peças mais importantes da aerodinâmica. De 2022 a 2025 tinha túneis que sugavam o carro contra a pista. Em 2026 ficou mais plano e mais estreito, com um difusor maior atrás: gera menos pressão, mas o carro quase não quica mais nas retas.',
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
    ponto: [0.2, 0.84, 0],
    texto:
      'Arco de titânio sobre a cabeça do piloto, obrigatório desde 2018. Aguenta cargas de mais de 12 toneladas e já evitou ferimentos graves em vários acidentes.',
    termos: ['halo'],
  },
  {
    id: 'arco-de-protecao',
    nome: 'Arco de proteção',
    ponto: [-0.6, 0.92, 0],
    texto:
      'Fica acima da cabeça do piloto e protege numa capotagem. Em 2026 precisa aguentar 20G, antes eram 16G. Por dentro passa a entrada de ar do motor, e no alto vai a câmera de TV que olha para a frente e para trás.',
    termos: ['halo'],
  },
  {
    id: 'sidepods',
    nome: 'Sidepods',
    ponto: [-0.2, 0.46, 0.72],
    texto:
      'As laterais guardam os radiadores do motor e da parte elétrica. O formato muda muito de equipe para equipe, porque decide como o ar chega à traseira do carro.',
    termos: [],
  },
  {
    id: 'unidade-de-potencia',
    nome: 'Unidade de potência',
    ponto: [-1.2, 0.85, 0],
    texto:
      'Fica atrás do piloto: um V6 turbo de 1,6 litro trabalhando junto com um motor elétrico que recupera energia nas frenagens. Em 2026 o motor a combustão caiu para cerca de 400 kW e o elétrico subiu de 120 para 350 kW, quase metade da potência. O combustível passou a ser 100% sustentável.',
    termos: ['unidade-de-potencia', 'ers'],
  },
  {
    id: 'freios',
    nome: 'Freios',
    ponto: [2.05, 0.2, 0.95],
    texto:
      'Discos e pastilhas de carbono, escondidos dentro das rodas, que passam de 1.000 °C numa frenagem forte. Os dutos que levam ar até eles também são peças aerodinâmicas. Atrás, parte da frenagem é feita pelo motor elétrico, que transforma a desaceleração em energia para a bateria.',
    termos: ['ers'],
  },
  {
    id: 'prancha',
    nome: 'Prancha',
    ponto: [-0.3, 0.06, 0.5],
    texto:
      'Uma tábua presa embaixo do assoalho, de ponta a ponta. Ela se desgasta quando o carro raspa no chão e é medida depois da corrida: se estiver fina demais, o piloto é desclassificado. Assim ninguém pode andar baixo demais.',
    termos: ['efeito-solo'],
  },
  {
    id: 'luzes',
    nome: 'Luzes traseiras',
    ponto: [-2.55, 0.5, 0],
    texto:
      'A luz vermelha no centro da traseira acende na chuva e quando o carro está recarregando a bateria e perdendo velocidade. Em 2026 ganharam a companhia de luzes nas placas laterais da asa, que mostram o estado da parte elétrica para quem vem atrás.',
    termos: ['ers'],
  },
  {
    id: 'asa-traseira',
    nome: 'Asa traseira',
    ponto: [-2.38, 1, 0.5],
    texto:
      'Dá pressão à traseira para o carro não escapar nas curvas. De 2011 a 2025 tinha o DRS, que abria o flap nas retas só para quem atacava. Em 2026 a asa passou a abrir nas retas para todos os carros, e a asinha de baixo (a beam wing) foi eliminada. A Ferrari criou uma versão cujo elemento de cima gira e fica de cabeça para baixo.',
    termos: ['drs', 'aerodinamica-ativa'],
  },
  {
    id: 'difusor',
    nome: 'Difusor',
    ponto: [-2.5, 0.25, 0.45],
    texto:
      'A saída do assoalho, embaixo da traseira. Ao abrir espaço para o ar se expandir, ajuda a sugar o carro contra o chão. Em 2026 ficou maior, e quase todas as equipes abriram um furo na lateral dele para manter o ar colado.',
    termos: ['downforce', 'efeito-solo'],
  },
];

const EN: Record<string, Pick<Peca, 'nome' | 'texto'>> = {
  'asa-dianteira': {
    nome: 'Front wing',
    texto:
      'The first part to meet the air. It makes downforce at the front and guides the flow around the wheels and under the floor. In 2026 it gained flaps that change position between corners and straights.',
  },
  nariz: {
    nome: 'Nose',
    texto:
      'The tip of the car holds the structure that absorbs frontal impacts. In 2026 it began working in two stages, to protect in a second hit too. Each team picks its height and width: a high nose lets more air pass underneath towards the floor.',
  },
  suspensao: {
    nome: 'Suspension',
    texto:
      'Carbon fibre arms link the wheels to the car and also guide the air. The spring can be worked by a rod that pushes (pushrod) or pulls (pullrod). In 2026 almost everyone uses pushrod at the front; Alpine, Williams and Cadillac stayed with pullrod.',
  },
  'aletas-do-assoalho': {
    nome: 'Floor boards',
    texto:
      'Boards at the front of the floor, just behind the front wheels. They returned in 2026, with up to three elements, and must push the air inwards instead of outwards. It is where the cars differ most from each other.',
  },
  pneus: {
    nome: 'Tyres',
    texto:
      'The car’s only contact with the ground. Pirelli brings dry compounds, from the hardest to the softest, and two wet ones. The wheels have been 18 inches since 2022, and in 2026 the tyres got narrower: 25 mm less at the front and 30 mm at the rear.',
  },
  assoalho: {
    nome: 'Floor',
    texto:
      'One of the most important aerodynamic parts. From 2022 to 2025 it had tunnels that sucked the car onto the track. In 2026 it became flatter and narrower, with a bigger diffuser behind: it makes less downforce, but the car hardly bounces on the straights any more.',
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
  'arco-de-protecao': {
    nome: 'Roll hoop',
    texto:
      'It sits above the driver’s head and protects in a rollover. In 2026 it must withstand 20G, up from 16G. The engine air intake runs through it, and on top sits the TV camera that looks forwards and backwards.',
  },
  sidepods: {
    nome: 'Sidepods',
    texto:
      'The sides hold the radiators for the engine and the electric system. Their shape varies a lot from team to team, because it decides how the air reaches the back of the car.',
  },
  'unidade-de-potencia': {
    nome: 'Power unit',
    texto:
      'It sits behind the driver: a 1.6-litre turbo V6 working with an electric motor that recovers energy under braking. In 2026 the combustion engine dropped to about 400 kW and the electric motor rose from 120 to 350 kW, almost half the power. The fuel became 100% sustainable.',
  },
  freios: {
    nome: 'Brakes',
    texto:
      'Carbon discs and pads, hidden inside the wheels, that go past 1,000 °C under hard braking. The ducts that feed them air are aerodynamic parts too. At the rear, part of the braking is done by the electric motor, which turns the slowing down into energy for the battery.',
  },
  prancha: {
    nome: 'Plank',
    texto:
      'A board fixed under the floor, from front to back. It wears when the car scrapes the ground and is measured after the race: if it is too thin, the driver is disqualified. That way nobody can run too low.',
  },
  luzes: {
    nome: 'Rear lights',
    texto:
      'The red light at the centre of the rear comes on in the rain and when the car is recharging its battery and losing speed. In 2026 it was joined by lights on the wing endplates, which show the state of the electric system to the cars behind.',
  },
  'asa-traseira': {
    nome: 'Rear wing',
    texto:
      'It gives the rear downforce so the car does not slide in corners. From 2011 to 2025 it had DRS, which opened the flap on straights only for the attacking car. In 2026 the wing began opening on straights for every car, and the small lower wing (the beam wing) was removed. Ferrari built a version whose top element rotates and ends up upside down.',
  },
  difusor: {
    nome: 'Diffuser',
    texto:
      'The exit of the floor, under the rear. By giving the air room to expand, it helps suck the car onto the ground. In 2026 it got bigger, and almost every team cut a hole in its side to keep the air attached.',
  },
};

const PECAS_EN: Peca[] = PECAS.map((peca) => ({ ...peca, ...EN[peca.id] }));

export function pecasNoIdioma(): Peca[] {
  return idiomaAtual() === 'en' ? PECAS_EN : PECAS;
}
