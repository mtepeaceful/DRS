import { idiomaAtual } from '../../shared/i18n/idioma';
import { type Era, ERAS } from './eras';

type Traducao = Pick<Era, 'nome' | 'resumo' | 'mudancas'> & { marcos: string[] };

const EN: Record<string, Traducao> = {
  'motor-dianteiro': {
    nome: 'Engine in front',
    resumo:
      'The first world championship cars were heirs to the pre-war Grands Prix: engine in front, thin tyres, a tubular chassis and no protection for the driver.',
    mudancas: [
      'Front engine, with the driver sitting high, almost over the rear axle',
      'From 1954 to 1960, naturally aspirated engines of up to 2.5 litres',
      'No seat belts, and helmets made of leather or cork',
    ],
    marcos: [
      'Won every race it entered in 1950 and gave Nino Farina the first title.',
      'It even had a fully enclosed version for fast tracks. With it, Fangio won most races of 1954 and 1955.',
    ],
  },
  'motor-traseiro': {
    nome: 'The rear-engine revolution',
    resumo:
      'The small Coopers put the engine behind the driver and proved that a light, well-balanced car could beat the giants. Within a few years, nobody raced with a front engine anymore.',
    mudancas: [
      'Mid-mounted engine behind the driver, who now races almost lying down',
      'Monocoque chassis instead of a tubular one',
      '1.5-litre engines from 1961 to 1965 and 3-litre engines from 1966',
    ],
    marcos: [
      'The first rear-engined champion car, with Jack Brabham.',
      'Colin Chapman’s monocoque made the car lighter and stiffer. Jim Clark won the 1963 title with it.',
    ],
  },
  asas: {
    nome: 'Wings and sponsors',
    resumo:
      'Teams found out that upside-down wings push the car onto the ground. At the same time, national colours gave way to sponsor liveries.',
    mudancas: [
      'Front and rear wings start making downforce',
      'High wings mounted on the suspension are banned in 1969 after serious failures',
      'The Ford Cosworth DFV engine becomes the standard for almost the whole grid',
    ],
    marcos: [
      'High wings and the first big sponsor livery, from Gold Leaf.',
      'Wedge shape and side radiators, a design everyone copied.',
      'The six-wheeled car, with four small wheels at the front. It won the Swedish GP.',
    ],
  },
  'efeito-solo': {
    nome: 'The first ground effect',
    resumo:
      'Lotus turned the whole car into an upside-down wing: the floor sped up the air underneath and sucked the car onto the track. Cornering speeds soared, and so did the crashes.',
    mudancas: [
      'Wing-shaped sidepods with skirts that sealed the air under the car',
      'Corners taken much faster, with the driver under huge forces',
      'From 1983 the floor must be flat',
    ],
    marcos: [
      'Dominated the season and gave Mario Andretti the title.',
      'The "fan car", which sucked the air from underneath with a fan. It won in Sweden and was withdrawn.',
    ],
  },
  turbo: {
    nome: 'The turbo era',
    resumo:
      'Renault bet on a 1.5-litre turbo engine while everyone else used the aspirated Cosworth. A decade later, turbos made over a thousand horsepower in qualifying.',
    mudancas: [
      '1.5-litre turbo engines against 3-litre aspirated ones',
      'Carbon-fibre monocoque, lighter and stronger',
      'Turbos banned from 1989',
    ],
    marcos: [
      'First win for a turbo engine, with Jean-Pierre Jabouille, in France.',
      'The first full carbon-fibre monocoque, now standard on every car.',
      'Senna and Prost won 15 of the 16 races. Senna became champion for the first time.',
    ],
  },
  aspirados: {
    nome: 'Aspirated engines and electronics',
    resumo:
      'Back to aspirated engines, the fight moved to electronics and to V10s revving above 19,000 rpm. Driver aids were banned and later allowed again.',
    mudancas: [
      'Semi-automatic gearbox with paddles behind the steering wheel',
      'Active suspension and traction control, banned in 1994',
      'Refuelling during races from 1994 to 2009',
      'Grooved tyres from 1998 to 2008',
    ],
    marcos: [
      'Debuted the semi-automatic gearbox and won its first race, in Brazil.',
      'Active suspension gave Nigel Mansell the title with ease.',
      'The peak of the Schumacher era: 15 wins in 18 races.',
    ],
  },
  v8: {
    nome: 'V8s, KERS and diffusers',
    resumo:
      'Engines became 2.4-litre V8s and engineering focused on aerodynamics. In 2009 the rules changed almost everything, and a newly bought team became champion.',
    mudancas: [
      '2.4-litre V8 engines',
      'In 2009, slick tyres return along with KERS, the first energy recovery system',
      'DRS arrives in 2011 to make overtaking easier',
    ],
    marcos: [
      'The double diffuser took Brawn to both titles in the team’s only season.',
      'The exhaust-blown diffuser helped Vettel win 11 races.',
    ],
  },
  hibridos: {
    nome: 'The hybrids',
    resumo:
      'The 1.6-litre turbo V6 began working with electric motors that reuse energy from braking and the exhaust. Mercedes got it right first time and won eight constructors’ titles in a row.',
    mudancas: [
      'Hybrid power unit: turbo V6, MGU-K and MGU-H',
      'In 2017, wider cars and tyres, and much faster',
      'The halo becomes mandatory in 2018',
    ],
    marcos: [
      'Won 16 of the 19 races and started Mercedes’ run of titles.',
      'Considered one of the fastest cars in history. Hamilton matched Schumacher’s seven titles.',
    ],
  },
  'efeito-solo-de-volta': {
    nome: 'Ground effect returns',
    resumo:
      'So cars could run close to each other, downforce came from the floor again, with tunnels under the car. With it came porpoising, the bouncing at high speed.',
    mudancas: [
      'Floor with tunnels that make most of the downforce',
      '18-inch wheels',
      'A cost cap limiting the teams’ budgets',
    ],
    marcos: ['Won 21 of the 22 races, the most complete domination in F1 history.'],
  },
  'aerodinamica-ativa': {
    nome: 'Active aerodynamics',
    resumo:
      'The 2026 rules made cars smaller and lighter, with wings that change position during the lap and half the power coming from the electric side.',
    mudancas: [
      'Moving front and rear wings: more downforce in corners, less drag on straights',
      'DRS goes, and an overtake mode with extra electric energy comes in',
      'Power split almost half and half between the combustion engine and the electric motor, with no MGU-H',
      '100% sustainable fuel',
    ],
    marcos: [],
  },
};

const ERAS_EN: Era[] = ERAS.map((era) => {
  const en = EN[era.id];
  if (!en) return era;

  return {
    ...era,
    nome: en.nome,
    resumo: en.resumo,
    mudancas: en.mudancas,
    marcos: era.marcos.map((marco, indice) => ({
      ...marco,
      texto: en.marcos[indice] ?? marco.texto,
    })),
  };
});

export function erasNoIdioma(): Era[] {
  return idiomaAtual() === 'en' ? ERAS_EN : ERAS;
}
