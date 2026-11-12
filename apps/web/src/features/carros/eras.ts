export interface Marco {
  ano: number;
  carro: string;
  texto: string;
}

export interface Era {
  id: string;
  periodo: string;
  nome: string;
  resumo: string;
  mudancas: string[];
  marcos: Marco[];
  termos: string[];
}

export const ERAS: Era[] = [
  {
    id: 'motor-dianteiro',
    periodo: '1950–1957',
    nome: 'Motor na frente',
    resumo:
      'Os primeiros carros do mundial eram herdeiros dos Grand Prix de antes da guerra: motor na frente, pneus finos, chassi tubular e nenhuma proteção para o piloto.',
    mudancas: [
      'Motor dianteiro e piloto sentado alto, quase em cima do eixo traseiro',
      'De 1954 a 1960, motores aspirados de até 2,5 litros',
      'Sem cinto de segurança e com capacetes de couro ou cortiça',
    ],
    marcos: [
      {
        ano: 1950,
        carro: 'Alfa Romeo 158',
        texto:
          'Venceu todas as corridas que disputou em 1950 e deu o primeiro título a Nino Farina.',
      },
      {
        ano: 1954,
        carro: 'Mercedes W196',
        texto:
          'Tinha até versão com carenagem fechada para pistas rápidas. Com ele, Fangio venceu a maior parte das corridas de 1954 e 1955.',
      },
    ],
    termos: [],
  },
  {
    id: 'motor-traseiro',
    periodo: '1958–1967',
    nome: 'A revolução do motor traseiro',
    resumo:
      'Os pequenos Cooper puseram o motor atrás do piloto e provaram que um carro leve e bem equilibrado batia os gigantes. Em poucos anos, ninguém mais corria com motor na frente.',
    mudancas: [
      'Motor central, atrás do piloto, que passa a correr quase deitado',
      'Chassi monocoque no lugar do chassi tubular',
      'Motores de 1,5 litro de 1961 a 1965 e de 3 litros a partir de 1966',
    ],
    marcos: [
      {
        ano: 1959,
        carro: 'Cooper T51',
        texto: 'Primeiro carro de motor traseiro campeão, com Jack Brabham.',
      },
      {
        ano: 1962,
        carro: 'Lotus 25',
        texto:
          'O monocoque de Colin Chapman deixou o carro mais leve e rígido. Jim Clark foi campeão com ele em 1963.',
      },
    ],
    termos: [],
  },
  {
    id: 'asas',
    periodo: '1968–1976',
    nome: 'Asas e patrocínio',
    resumo:
      'As equipes descobriram que asas invertidas empurram o carro contra o chão. Ao mesmo tempo, as cores nacionais deram lugar às pinturas dos patrocinadores.',
    mudancas: [
      'Asas dianteira e traseira passam a gerar pressão aerodinâmica',
      'As asas altas, presas na suspensão, são proibidas em 1969 depois de quebras graves',
      'O motor Ford Cosworth DFV vira o padrão de quase todo o grid',
    ],
    marcos: [
      {
        ano: 1968,
        carro: 'Lotus 49B',
        texto: 'Asas altas e a primeira grande pintura de patrocinador, da Gold Leaf.',
      },
      {
        ano: 1970,
        carro: 'Lotus 72',
        texto: 'Formato de cunha e radiadores nas laterais, desenho copiado por todo mundo.',
      },
      {
        ano: 1976,
        carro: 'Tyrrell P34',
        texto: 'O carro de seis rodas, com quatro pequenas na frente. Venceu o GP da Suécia.',
      },
    ],
    termos: ['downforce'],
  },
  {
    id: 'efeito-solo',
    periodo: '1977–1982',
    nome: 'O primeiro efeito solo',
    resumo:
      'A Lotus transformou o carro inteiro numa asa invertida: o assoalho acelerava o ar por baixo e sugava o carro contra a pista. As velocidades nas curvas dispararam, e os acidentes também.',
    mudancas: [
      'Laterais em forma de asa com saias que vedavam o ar por baixo do carro',
      'Curvas feitas muito mais rápido, com o piloto submetido a forças enormes',
      'Em 1983 o assoalho passa a ser obrigatoriamente plano',
    ],
    marcos: [
      {
        ano: 1978,
        carro: 'Lotus 79',
        texto: 'Dominou a temporada e deu o título a Mario Andretti.',
      },
      {
        ano: 1978,
        carro: 'Brabham BT46B',
        texto:
          'O "carro ventilador", que sugava o ar por baixo com uma hélice. Venceu na Suécia e foi retirado.',
      },
    ],
    termos: ['efeito-solo', 'downforce'],
  },
  {
    id: 'turbo',
    periodo: '1977–1988',
    nome: 'A era turbo',
    resumo:
      'A Renault apostou num motor de 1,5 litro com turbo quando todos usavam o Cosworth aspirado. Uma década depois, os turbos passavam de mil cavalos na classificação.',
    mudancas: [
      'Motores turbo de 1,5 litro contra os aspirados de 3 litros',
      'Monocoque de fibra de carbono, mais leve e resistente',
      'Turbos proibidos a partir de 1989',
    ],
    marcos: [
      {
        ano: 1979,
        carro: 'Renault RS10',
        texto: 'Primeira vitória de um motor turbo, com Jean-Pierre Jabouille, na França.',
      },
      {
        ano: 1981,
        carro: 'McLaren MP4/1',
        texto: 'Primeiro monocoque inteiro de fibra de carbono, hoje padrão em todo carro.',
      },
      {
        ano: 1988,
        carro: 'McLaren MP4/4',
        texto: 'Senna e Prost venceram 15 das 16 corridas. Senna foi campeão pela primeira vez.',
      },
    ],
    termos: [],
  },
  {
    id: 'aspirados',
    periodo: '1989–2005',
    nome: 'Aspirados e eletrônica',
    resumo:
      'De volta aos motores aspirados, a briga foi para a eletrônica e para os V10 que giravam acima de 19 mil rotações. Os auxílios eletrônicos chegaram a ser proibidos e liberados de novo.',
    mudancas: [
      'Câmbio semiautomático com borboletas atrás do volante',
      'Suspensão ativa e controle de tração, proibidos em 1994',
      'Reabastecimento durante as corridas de 1994 a 2009',
      'Pneus com sulcos de 1998 a 2008',
    ],
    marcos: [
      {
        ano: 1989,
        carro: 'Ferrari 640',
        texto: 'Estreou o câmbio semiautomático e venceu na primeira corrida, no Brasil.',
      },
      {
        ano: 1992,
        carro: 'Williams FW14B',
        texto: 'A suspensão ativa deu o título a Nigel Mansell com folga.',
      },
      {
        ano: 2004,
        carro: 'Ferrari F2004',
        texto: 'O auge da era Schumacher: 15 vitórias em 18 corridas.',
      },
    ],
    termos: ['pit-stop'],
  },
  {
    id: 'v8',
    periodo: '2006–2013',
    nome: 'V8, KERS e difusores',
    resumo:
      'Os motores viraram V8 de 2,4 litros e a engenharia se concentrou na aerodinâmica. Em 2009 o regulamento mudou quase tudo, e uma equipe recém-comprada foi campeã.',
    mudancas: [
      'Motores V8 de 2,4 litros',
      'Em 2009, pneus lisos de volta e o KERS, primeiro sistema de recuperação de energia',
      'O DRS chega em 2011 para facilitar as ultrapassagens',
    ],
    marcos: [
      {
        ano: 2009,
        carro: 'Brawn BGP 001',
        texto: 'O difusor duplo levou a Brawn aos dois títulos na única temporada da equipe.',
      },
      {
        ano: 2011,
        carro: 'Red Bull RB7',
        texto: 'O difusor soprado pelo escapamento ajudou Vettel a vencer 11 corridas.',
      },
    ],
    termos: ['drs', 'compostos'],
  },
  {
    id: 'hibridos',
    periodo: '2014–2021',
    nome: 'Os híbridos',
    resumo:
      'O V6 turbo de 1,6 litro passou a trabalhar junto com motores elétricos que reaproveitam a energia da frenagem e do escapamento. A Mercedes acertou de primeira e ganhou oito títulos de construtores seguidos.',
    mudancas: [
      'Unidade de potência híbrida: V6 turbo, MGU-K e MGU-H',
      'Em 2017, carros e pneus mais largos e muito mais rápidos',
      'O halo vira obrigatório em 2018',
    ],
    marcos: [
      {
        ano: 2014,
        carro: 'Mercedes W05',
        texto: 'Venceu 16 das 19 corridas e abriu a sequência de títulos da Mercedes.',
      },
      {
        ano: 2020,
        carro: 'Mercedes W11',
        texto:
          'Considerado um dos carros mais rápidos da história. Hamilton igualou os sete títulos de Schumacher.',
      },
    ],
    termos: ['unidade-de-potencia', 'ers', 'halo'],
  },
  {
    id: 'efeito-solo-de-volta',
    periodo: '2022–2025',
    nome: 'O efeito solo de volta',
    resumo:
      'Para os carros conseguirem andar perto um do outro, a pressão aerodinâmica voltou a vir do assoalho, com túneis embaixo do carro. Veio junto o porpoising, o quique em alta velocidade.',
    mudancas: [
      'Assoalho com túneis que geram a maior parte da pressão',
      'Rodas de 18 polegadas',
      'Teto de gastos limitando o orçamento das equipes',
    ],
    marcos: [
      {
        ano: 2023,
        carro: 'Red Bull RB19',
        texto: 'Venceu 21 das 22 corridas, o domínio mais completo da história da F1.',
      },
    ],
    termos: ['efeito-solo', 'porpoising', 'ar-sujo', 'teto-de-gastos'],
  },
  {
    id: 'aerodinamica-ativa',
    periodo: '2026–',
    nome: 'Aerodinâmica ativa',
    resumo:
      'O regulamento de 2026 deixou os carros menores e mais leves, com asas que mudam de posição durante a volta e metade da potência vinda da parte elétrica.',
    mudancas: [
      'Asas dianteira e traseira móveis: mais pressão nas curvas, menos arrasto nas retas',
      'O DRS sai e entra um modo de ultrapassagem com energia elétrica extra',
      'Potência dividida quase meio a meio entre o motor a combustão e o elétrico, sem o MGU-H',
      'Combustível 100% sustentável',
    ],
    marcos: [],
    termos: ['aerodinamica-ativa', 'drs', 'unidade-de-potencia'],
  },
];
