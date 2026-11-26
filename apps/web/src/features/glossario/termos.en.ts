import type { Categoria } from './termos';

export const CATEGORIAS_EN: Record<Categoria, string> = {
  'fim-de-semana': 'Race weekend',
  estrategia: 'Strategy and tyres',
  carro: 'Car',
  bandeiras: 'Flags and safety',
  regras: 'Rules and championship',
};

interface TermoEn {
  nome: string;
  tambem?: string;
  definicao: string;
  noSite?: string;
}

export const TERMOS_EN: Record<string, TermoEn> = {
  'treino-livre': {
    nome: 'Free practice',
    definicao:
      'Sessions with no points at stake, where teams set up the car, test tyres and run race simulations. A normal weekend has three; a sprint weekend has only one.',
  },
  classificacao: {
    nome: 'Qualifying',
    tambem: 'Q1, Q2 and Q3',
    definicao:
      'The session that sets the starting grid. It has three parts: the slowest drivers in Q1 and Q2 are knocked out, and the ten who reach Q3 fight for pole position.',
    noSite: 'See the qualifying of each GP on the calendar',
  },
  'pole-position': {
    nome: 'Pole position',
    definicao:
      'First place on the grid, earned by the fastest lap in Q3. It brings prestige but no points.',
  },
  'grid-de-largada': {
    nome: 'Starting grid',
    definicao:
      'The cars lined up before the start, two by two, in the order set by qualifying and penalties.',
  },
  'volta-de-apresentacao': {
    nome: 'Formation lap',
    definicao:
      'A slow lap before the start to warm up tyres and brakes. At the end the cars stop on the grid and wait for the red lights to go out.',
  },
  sprint: {
    nome: 'Sprint',
    definicao:
      'A short race of about 100 km, held on Saturday at some weekends. It has its own qualifying and gives points to the top eight, from 8 down to 1.',
    noSite: 'Sprint results on the calendar',
  },
  podio: {
    nome: 'Podium',
    definicao: 'The top three finishers of a race, who climb the podium to receive the trophies.',
  },
  'volta-mais-rapida': {
    nome: 'Fastest lap',
    tambem: 'FL',
    definicao:
      'The quickest lap of the whole race. From 2019 to 2024 it was worth an extra point for a driver finishing in the top ten; since 2025 it is only a record.',
  },
  'grand-chelem': {
    nome: 'Grand Chelem',
    definicao:
      'The perfect weekend: pole position, the win, the fastest lap and leading every lap of the race.',
  },
  'parc-ferme': {
    nome: 'Parc fermé',
    definicao:
      'A regime in which the car cannot be changed. It runs from qualifying to the race, so nobody builds a car just for one fast lap.',
  },
  'largada-do-pit-lane': {
    nome: 'Pit lane start',
    definicao:
      'When a car leaves the pits instead of the grid, after everyone has gone by. It happens, for example, when the team works on the car during parc fermé.',
  },
  retardatario: {
    nome: 'Backmarker',
    tambem: 'Lapped car',
    definicao:
      'A driver lapped by the leader. In the final results they show "+1 lap", "+2 laps" and so on, instead of a time.',
  },
  'nao-classificado': {
    nome: 'Not classified',
    tambem: 'NC',
    definicao:
      'A driver who did not cover at least 90% of the winner’s distance, usually after retiring. They are left out of the official race results.',
  },
  'pit-stop': {
    nome: 'Pit stop',
    definicao:
      'A stop in the pits to change tyres or fix the car. The best teams change all four tyres in just over two seconds.',
  },
  stint: {
    nome: 'Stint',
    definicao: 'The part of the race between two pit stops, run on the same set of tyres.',
  },
  undercut: {
    nome: 'Undercut',
    definicao:
      'Stopping before a rival to use the faster new tyres and come out ahead when the rival stops too.',
  },
  overcut: {
    nome: 'Overcut',
    definicao:
      'The opposite of the undercut: staying out on a clear track while the rival stops, and gaining the place on your own stop.',
  },
  compostos: {
    nome: 'Tyre compounds',
    tambem: 'Soft, medium and hard',
    definicao:
      'Dry tyres come in different rubbers: the soft is faster and wears sooner, the hard lasts longer and is slower. In a dry race each driver must use at least two compounds.',
  },
  'pneus-de-chuva': {
    nome: 'Intermediate and wet tyres',
    definicao:
      'Grooved tyres for a wet track. The intermediate is for a damp track; the full wet is for heavy water, because it clears much more of it.',
  },
  degradacao: {
    nome: 'Degradation',
    definicao:
      'The loss of tyre performance as it wears and heats up. It sets how many laps a set can last and, with that, the strategy.',
  },
  drs: {
    nome: 'DRS',
    tambem: 'Drag Reduction System',
    definicao:
      'A system that opened the rear wing flap on set straights to cut drag and help overtaking. Only a driver less than one second behind the car ahead could use it. It existed from 2011 to 2025; in 2026 it gave way to active aerodynamics. It is also the pun in this site’s name, the Data Retrieval System.',
    noSite: 'Open and close the DRS in any driver’s 3D garage',
  },
  'aerodinamica-ativa': {
    nome: 'Active aerodynamics',
    definicao:
      'Front and rear wings that change position during the lap: more downforce in corners and less drag on straights. It arrived in 2026 with an overtake mode that releases extra electric power to a driver close to the car ahead.',
  },
  downforce: {
    nome: 'Downforce',
    tambem: 'Aerodynamic load',
    definicao:
      'The force of the air pushing the car onto the ground. More downforce allows faster cornering, but usually comes with more drag on the straights.',
  },
  'efeito-solo': {
    nome: 'Ground effect',
    definicao:
      'Downforce made by the car’s floor, which speeds up the air underneath it. A Lotus trademark in the 1970s, it was later banned and came back in 2022.',
  },
  porpoising: {
    nome: 'Porpoising',
    definicao:
      'The car bouncing at high speed, when ground effect pulls the floor down, loses grip near the ground and lets go again, in a cycle.',
  },
  vacuo: {
    nome: 'Slipstream',
    tambem: 'Tow',
    definicao:
      'Running right behind another car on a straight, where there is less air resistance, to gain speed and try to overtake.',
  },
  'ar-sujo': {
    nome: 'Dirty air',
    definicao:
      'The turbulent air left behind a car. In corners it takes downforce away from the car behind and makes following closely hard.',
  },
  halo: {
    nome: 'Halo',
    definicao:
      'A titanium hoop over the cockpit that protects the driver’s head. Mandatory since 2018, it has already saved drivers in serious crashes.',
    noSite: 'See the halo on the car explained',
  },
  'unidade-de-potencia': {
    nome: 'Power unit',
    definicao:
      'What drives the car: a turbo V6 combustion engine and the hybrid system that recovers and redeploys electric energy.',
  },
  ers: {
    nome: 'ERS',
    tambem: 'Energy Recovery System',
    definicao:
      'The hybrid part of the power unit: it recovers energy under braking, stores it in a battery and gives it back as extra power.',
  },
  'modo-de-ultrapassagem': {
    nome: 'Overtake mode',
    definicao:
      'The replacement for DRS from 2026. A driver who crosses the detection point less than a second behind the car ahead gets extra electric energy to use on the next lap and try to pass.',
  },
  'modo-de-curva-e-de-reta': {
    nome: 'Corner mode and straight mode',
    tambem: 'Z-mode and X-mode',
    definicao:
      'The two wing positions of the 2026 active aerodynamics. In corner mode the flaps are closed and the car sticks to the ground; in straight mode they open like a Venetian blind and drag drops. Every car uses them, not only the attacker.',
  },
  'pushrod-e-pullrod': {
    nome: 'Pushrod and pullrod',
    definicao:
      'The two ways to link the wheel to the suspension springs. A pushrod runs from the bottom of the wheel and pushes; a pullrod runs from the top and pulls. The choice changes the height of the parts and the path of the air. In 2026 almost everyone uses pushrod at the front.',
  },
  mousehole: {
    nome: 'Mousehole',
    definicao:
      'A hole in the side wall of the diffuser that lets outside air in to keep the flow attached under the car. It became standard on the 2026 cars.',
  },
  prancha: {
    nome: 'Plank',
    definicao:
      'A board fixed under the floor that wears when the car scrapes the ground. It is measured after the race, and if it is too thin the driver is disqualified.',
  },
  lastro: {
    nome: 'Ballast',
    definicao:
      'Extra weight fixed at chosen points of the car to reach the minimum weight, which is 768 kg in 2026. Cars under the limit use ballast to balance the car; cars over it lose time, about 0.3 s per lap for every 10 kg.',
  },
  'safety-car': {
    nome: 'Safety car',
    definicao:
      'A car that comes onto the track after a crash or hazard. Drivers line up behind it, with no overtaking, until the track is clear.',
  },
  'safety-car-virtual': {
    nome: 'Virtual safety car',
    tambem: 'VSC',
    definicao:
      'A neutralisation with no car on track: everyone must respect a minimum time per sector, which keeps the gaps between them.',
  },
  'bandeira-amarela': {
    nome: 'Yellow flag',
    definicao:
      'Danger ahead: drivers must slow down and may not overtake in that section. Double yellows mean greater danger.',
  },
  'bandeira-vermelha': {
    nome: 'Red flag',
    definicao:
      'The session is stopped, for a serious crash or dangerous conditions. Cars return slowly to the pits and wait for the restart.',
  },
  'bandeira-azul': {
    nome: 'Blue flag',
    definicao:
      'A warning to a backmarker that a faster car, a lap ahead, is coming. They must let it through.',
  },
  'bandeira-quadriculada': {
    nome: 'Chequered flag',
    definicao: 'The end of the session or race. The first to take it in the race is the winner.',
  },
  pontuacao: {
    nome: 'Points system',
    definicao:
      'In the race the top ten score: 25, 18, 15, 12, 10, 8, 6, 4, 2 and 1. In the sprint, the top eight, from 8 down to 1. Whoever scores the most in the year is champion.',
    noSite: 'Current championship standings',
  },
  'campeonato-de-construtores': {
    nome: 'Constructors’ championship',
    definicao:
      'The fight between teams, which add up the points of their two drivers. It has existed since 1958 and decides how the championship money is shared.',
    noSite: 'Champions of each year in F1 history',
  },
  'penalidade-de-grid': {
    nome: 'Grid penalty',
    definicao:
      'A penalty that makes a driver start places behind their qualifying spot, for example for changing power unit parts beyond the season’s limit.',
  },
  'limites-de-pista': {
    nome: 'Track limits',
    definicao:
      'The white lines that mark the track. Going fully beyond them deletes the lap in qualifying and, if repeated in the race, brings a penalty.',
  },
  'teto-de-gastos': {
    nome: 'Cost cap',
    definicao:
      'A yearly limit on how much each team can spend to develop and race its cars, in force since 2021 to bring the big teams closer to the small ones.',
  },
};
