export interface Capitulo {
  id: string;
  ano: string;
  titulo: string;
  texto: string[];
  termos: string[];
}

export const CAPITULOS: Capitulo[] = [
  {
    id: 'problema',
    ano: '2009',
    titulo: 'O problema: ninguém conseguia passar',
    texto: [
      'No fim dos anos 2000, os carros dependiam tanto da aerodinâmica que o ar sujo deixado pelo carro da frente tirava a pressão aerodinâmica de quem vinha atrás. Chegar perto numa curva era fácil; completar a ultrapassagem, quase impossível.',
      'O regulamento de 2009 tentou resolver com asas mais simples e uma asa dianteira que o piloto podia ajustar duas vezes por volta. Ajudou pouco, e as corridas continuaram com longas filas de carros sem troca de posição.',
    ],
    termos: ['ar-sujo', 'downforce'],
  },
  {
    id: 'f-duct',
    ano: '2010',
    titulo: 'O truque da McLaren: o F-duct',
    texto: [
      'Em 2010, a McLaren apareceu com um duto que levava ar da frente do carro até a asa traseira. Na reta, o piloto tapava um furo no cockpit com a perna ou com a mão, o ar mudava de caminho e a asa traseira perdia o efeito: menos arrasto, mais velocidade final.',
      'Não havia peça móvel, por isso era legal. As outras equipes copiaram a ideia ao longo do ano, e a FIA decidiu proibir o F-duct para 2011, mas gostou do princípio: tirar arrasto na reta ajudava a ultrapassar.',
    ],
    termos: ['downforce'],
  },
  {
    id: 'nasce-o-drs',
    ano: '2011',
    titulo: 'Nasce o DRS',
    texto: [
      'Em 2011, a regra virou peça oficial: o Drag Reduction System, um flap da asa traseira que abre por comando do piloto. Com a asa aberta, o carro ganha cerca de 10 a 12 km/h no fim da reta.',
      'Na corrida, o uso tem condições: só nas zonas de DRS marcadas na pista, e só para quem passou pelo ponto de detecção a menos de um segundo do carro da frente. Nas duas primeiras voltas, logo depois de um safety car e quando a direção de prova considera a pista molhada demais, fica desligado.',
    ],
    termos: ['drs', 'vacuo'],
  },
  {
    id: 'ajustes',
    ano: '2013–2021',
    titulo: 'Ajustes e críticas',
    texto: [
      'Em 2013, o DRS deixou de ser livre nos treinos e na classificação e passou a valer só nas zonas, por segurança. Em 2019, a abertura do flap aumentou, de 50 para 85 milímetros, para deixar o efeito mais forte.',
      'As críticas nunca pararam: em algumas pistas a ultrapassagem ficava fácil demais, e em outras surgia o trem de DRS, uma fila de carros todos a menos de um segundo um do outro, em que ninguém conseguia escapar.',
    ],
    termos: ['drs'],
  },
  {
    id: 'efeito-solo',
    ano: '2022',
    titulo: 'O efeito solo volta',
    texto: [
      'O regulamento de 2022 atacou a causa do problema: com boa parte da pressão aerodinâmica gerada pelo assoalho, o carro de trás passou a sofrer menos com o ar sujo. O DRS continuou, mas virou um empurrão final, não mais a única chance de ultrapassar.',
    ],
    termos: ['efeito-solo', 'ar-sujo'],
  },
  {
    id: 'despedida',
    ano: '2026',
    titulo: 'A despedida',
    texto: [
      'Em 2026, o DRS saiu do regulamento. No lugar, todos os carros têm aerodinâmica ativa: as asas dianteira e traseira abrem nas retas para todo mundo, não só para quem ataca. Para ultrapassar, quem está a menos de um segundo do carro da frente ganha energia elétrica extra no modo de ultrapassagem.',
      'Foram 15 temporadas, de 2011 a 2025. O nome ficou neste site.',
    ],
    termos: ['aerodinamica-ativa', 'unidade-de-potencia'],
  },
];
