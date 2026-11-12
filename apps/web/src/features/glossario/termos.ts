export type Categoria = 'fim-de-semana' | 'estrategia' | 'carro' | 'bandeiras' | 'regras';

export const CATEGORIAS: Record<Categoria, string> = {
  'fim-de-semana': 'Fim de semana',
  estrategia: 'Estratégia e pneus',
  carro: 'Carro',
  bandeiras: 'Bandeiras e segurança',
  regras: 'Regras e campeonato',
};

export interface Termo {
  id: string;
  nome: string;
  tambem?: string;
  categoria: Categoria;
  definicao: string;
  relacionados: string[];
  noSite?: { texto: string; para: string };
}

export const TERMOS: Termo[] = [
  {
    id: 'treino-livre',
    nome: 'Treino livre',
    categoria: 'fim-de-semana',
    definicao:
      'Sessões sem valer pontos em que as equipes acertam o carro, testam pneus e simulam corrida. Num fim de semana normal são três; com sprint, só um.',
    relacionados: ['classificacao', 'sprint'],
  },
  {
    id: 'classificacao',
    nome: 'Classificação',
    tambem: 'Q1, Q2 e Q3',
    categoria: 'fim-de-semana',
    definicao:
      'Sessão que define o grid de largada. É dividida em três partes: os mais lentos do Q1 e do Q2 são eliminados, e os dez que chegam ao Q3 disputam a pole position.',
    relacionados: ['pole-position', 'grid-de-largada'],
    noSite: { texto: 'Veja a classificação de cada GP no calendário', para: '/calendario' },
  },
  {
    id: 'pole-position',
    nome: 'Pole position',
    categoria: 'fim-de-semana',
    definicao:
      'A primeira posição do grid, conquistada por quem faz a volta mais rápida no Q3. Vale prestígio, mas não vale pontos.',
    relacionados: ['classificacao', 'grand-chelem'],
  },
  {
    id: 'grid-de-largada',
    nome: 'Grid de largada',
    categoria: 'fim-de-semana',
    definicao:
      'A formação dos carros antes da largada, em fila dupla, na ordem definida pela classificação e pelas punições.',
    relacionados: ['classificacao', 'penalidade-de-grid', 'largada-do-pit-lane'],
  },
  {
    id: 'volta-de-apresentacao',
    nome: 'Volta de apresentação',
    categoria: 'fim-de-semana',
    definicao:
      'Volta lenta antes da largada, para aquecer pneus e freios. Ao fim dela os carros param no grid e esperam as luzes vermelhas se apagarem.',
    relacionados: ['grid-de-largada'],
  },
  {
    id: 'sprint',
    nome: 'Sprint',
    categoria: 'fim-de-semana',
    definicao:
      'Corrida curta, de cerca de 100 km, disputada no sábado em alguns fins de semana. Tem classificação própria e dá pontos aos oito primeiros, de 8 a 1.',
    relacionados: ['pontuacao', 'classificacao'],
    noSite: { texto: 'Resultado das sprints no calendário', para: '/calendario' },
  },
  {
    id: 'podio',
    nome: 'Pódio',
    categoria: 'fim-de-semana',
    definicao:
      'Os três primeiros colocados de uma corrida, que sobem ao pódio para receber os troféus.',
    relacionados: ['pontuacao'],
  },
  {
    id: 'volta-mais-rapida',
    nome: 'Volta mais rápida',
    tambem: 'VR',
    categoria: 'fim-de-semana',
    definicao:
      'A volta de menor tempo de toda a corrida. Entre 2019 e 2024 valia um ponto extra para quem terminasse entre os dez primeiros; desde 2025 é só um registro.',
    relacionados: ['pontuacao', 'grand-chelem'],
  },
  {
    id: 'grand-chelem',
    nome: 'Grand Chelem',
    categoria: 'fim-de-semana',
    definicao:
      'Fim de semana perfeito: pole position, vitória, volta mais rápida e liderança em todas as voltas da corrida.',
    relacionados: ['pole-position', 'volta-mais-rapida'],
  },
  {
    id: 'parc-ferme',
    nome: 'Parc fermé',
    categoria: 'fim-de-semana',
    definicao:
      'Regime em que o carro não pode ser modificado. Começa na classificação e vai até a corrida, para que ninguém monte um carro só para a volta rápida.',
    relacionados: ['classificacao', 'largada-do-pit-lane'],
  },
  {
    id: 'largada-do-pit-lane',
    nome: 'Largada do pit lane',
    categoria: 'fim-de-semana',
    definicao:
      'Quando o carro sai dos boxes em vez do grid, depois que todos passaram. Acontece, por exemplo, quando a equipe mexe no carro durante o parc fermé.',
    relacionados: ['parc-ferme', 'grid-de-largada'],
  },
  {
    id: 'retardatario',
    nome: 'Retardatário',
    tambem: 'Volta atrás',
    categoria: 'fim-de-semana',
    definicao:
      'Piloto que levou volta do líder. Na classificação final aparece com "+1 volta", "+2 voltas" e assim por diante, em vez do tempo.',
    relacionados: ['bandeira-azul', 'nao-classificado'],
  },
  {
    id: 'nao-classificado',
    nome: 'Não classificado',
    tambem: 'NC',
    categoria: 'fim-de-semana',
    definicao:
      'Piloto que não completou ao menos 90% da distância do vencedor, em geral por abandono. Fica fora da classificação oficial da corrida.',
    relacionados: ['retardatario'],
  },
  {
    id: 'pit-stop',
    nome: 'Pit stop',
    categoria: 'estrategia',
    definicao:
      'Parada nos boxes para trocar pneus ou consertar o carro. As melhores equipes trocam os quatro pneus em pouco mais de dois segundos.',
    relacionados: ['undercut', 'overcut', 'stint'],
  },
  {
    id: 'stint',
    nome: 'Stint',
    categoria: 'estrategia',
    definicao: 'Trecho da corrida entre dois pit stops, feito com o mesmo jogo de pneus.',
    relacionados: ['pit-stop', 'compostos'],
  },
  {
    id: 'undercut',
    nome: 'Undercut',
    categoria: 'estrategia',
    definicao:
      'Parar antes do rival para aproveitar os pneus novos, que são mais rápidos, e voltar à frente dele quando ele também parar.',
    relacionados: ['overcut', 'pit-stop'],
  },
  {
    id: 'overcut',
    nome: 'Overcut',
    categoria: 'estrategia',
    definicao:
      'O contrário do undercut: seguir com a pista livre enquanto o rival para, e ganhar a posição na sua própria parada.',
    relacionados: ['undercut', 'pit-stop'],
  },
  {
    id: 'compostos',
    nome: 'Compostos de pneus',
    tambem: 'Macio, médio e duro',
    categoria: 'estrategia',
    definicao:
      'Os pneus de pista seca têm borrachas diferentes: o macio é mais rápido e gasta antes, o duro dura mais e é mais lento. Na corrida seca, cada piloto precisa usar ao menos dois compostos.',
    relacionados: ['pneus-de-chuva', 'degradacao', 'stint'],
  },
  {
    id: 'pneus-de-chuva',
    nome: 'Pneus intermediários e de chuva',
    categoria: 'estrategia',
    definicao:
      'Pneus com sulcos para pista molhada. O intermediário serve para pista úmida; o de chuva, para muita água, porque escoa bem mais.',
    relacionados: ['compostos'],
  },
  {
    id: 'degradacao',
    nome: 'Degradação',
    categoria: 'estrategia',
    definicao:
      'A perda de desempenho do pneu conforme ele se desgasta e esquenta. Define quantas voltas um jogo de pneus aguenta e, com isso, a estratégia.',
    relacionados: ['compostos', 'stint'],
  },
  {
    id: 'drs',
    nome: 'DRS',
    tambem: 'Drag Reduction System',
    categoria: 'carro',
    definicao:
      'Sistema que abria o flap da asa traseira em retas determinadas para reduzir o arrasto e facilitar ultrapassagens. Só podia ser usado por quem estava a menos de um segundo do carro da frente. Existiu de 2011 a 2025; em 2026 deu lugar à aerodinâmica ativa. É também o trocadilho do nome deste site, o Data Retrieval System.',
    relacionados: ['aerodinamica-ativa', 'vacuo', 'ar-sujo'],
    noSite: { texto: 'Abra e feche o DRS na garagem 3D de qualquer piloto', para: '/pilotos' },
  },
  {
    id: 'aerodinamica-ativa',
    nome: 'Aerodinâmica ativa',
    categoria: 'carro',
    definicao:
      'Asas dianteira e traseira que mudam de posição durante a volta: mais pressão nas curvas e menos arrasto nas retas. Chegou em 2026 junto com um modo de ultrapassagem que libera energia elétrica extra para quem está perto do carro da frente.',
    relacionados: ['drs', 'downforce', 'ers'],
  },
  {
    id: 'downforce',
    nome: 'Downforce',
    tambem: 'Pressão aerodinâmica',
    categoria: 'carro',
    definicao:
      'Força que o ar faz empurrando o carro contra o chão. Mais downforce permite fazer curvas mais rápido, mas costuma vir com mais arrasto nas retas.',
    relacionados: ['efeito-solo', 'aerodinamica-ativa'],
  },
  {
    id: 'efeito-solo',
    nome: 'Efeito solo',
    categoria: 'carro',
    definicao:
      'Downforce gerado pelo assoalho do carro, que acelera o ar por baixo dele. Foi marca da Lotus nos anos 70, proibido depois, e voltou em 2022.',
    relacionados: ['downforce', 'porpoising'],
  },
  {
    id: 'porpoising',
    nome: 'Porpoising',
    categoria: 'carro',
    definicao:
      'Quicar do carro em alta velocidade, quando o efeito solo puxa o assoalho para baixo, perde força perto do chão e solta de novo, em ciclo.',
    relacionados: ['efeito-solo'],
  },
  {
    id: 'vacuo',
    nome: 'Vácuo',
    tambem: 'Slipstream',
    categoria: 'carro',
    definicao:
      'Andar logo atrás de outro carro na reta, onde há menos resistência do ar, para ganhar velocidade e tentar a ultrapassagem.',
    relacionados: ['ar-sujo', 'drs'],
  },
  {
    id: 'ar-sujo',
    nome: 'Ar sujo',
    categoria: 'carro',
    definicao:
      'O ar turbulento deixado por um carro. Nas curvas, ele tira downforce de quem vem atrás e dificulta seguir de perto.',
    relacionados: ['vacuo', 'downforce'],
  },
  {
    id: 'halo',
    nome: 'Halo',
    categoria: 'carro',
    definicao:
      'Arco de titânio sobre o cockpit que protege a cabeça do piloto. Obrigatório desde 2018, já salvou pilotos em acidentes graves.',
    relacionados: ['safety-car'],
    noSite: { texto: 'Veja o halo na garagem 3D', para: '/pilotos' },
  },
  {
    id: 'unidade-de-potencia',
    nome: 'Unidade de potência',
    categoria: 'carro',
    definicao:
      'O conjunto que move o carro: motor a combustão V6 turbo e o sistema híbrido que recupera e devolve energia elétrica.',
    relacionados: ['ers', 'penalidade-de-grid'],
  },
  {
    id: 'ers',
    nome: 'ERS',
    tambem: 'Sistema de recuperação de energia',
    categoria: 'carro',
    definicao:
      'Parte híbrida da unidade de potência: recupera energia nas frenagens, guarda numa bateria e devolve como potência extra.',
    relacionados: ['unidade-de-potencia', 'aerodinamica-ativa'],
  },
  {
    id: 'safety-car',
    nome: 'Safety car',
    categoria: 'bandeiras',
    definicao:
      'Carro de segurança que entra na pista depois de um acidente ou perigo. Os pilotos andam em fila atrás dele, sem ultrapassar, até a pista ser liberada.',
    relacionados: ['safety-car-virtual', 'bandeira-amarela', 'bandeira-vermelha'],
  },
  {
    id: 'safety-car-virtual',
    nome: 'Safety car virtual',
    tambem: 'VSC',
    categoria: 'bandeiras',
    definicao:
      'Neutralização sem o carro de segurança na pista: todos precisam respeitar um tempo mínimo por trecho, o que mantém as distâncias entre eles.',
    relacionados: ['safety-car'],
  },
  {
    id: 'bandeira-amarela',
    nome: 'Bandeira amarela',
    categoria: 'bandeiras',
    definicao:
      'Perigo à frente: é preciso reduzir e é proibido ultrapassar naquele trecho. Duas amarelas indicam perigo maior.',
    relacionados: ['safety-car', 'bandeira-vermelha'],
  },
  {
    id: 'bandeira-vermelha',
    nome: 'Bandeira vermelha',
    categoria: 'bandeiras',
    definicao:
      'Sessão interrompida, por acidente grave ou condições perigosas. Os carros voltam devagar aos boxes e esperam a retomada.',
    relacionados: ['bandeira-amarela', 'safety-car'],
  },
  {
    id: 'bandeira-azul',
    nome: 'Bandeira azul',
    categoria: 'bandeiras',
    definicao:
      'Aviso a um retardatário de que um carro mais rápido, uma volta à frente, vem atrás. Ele precisa deixar passar.',
    relacionados: ['retardatario'],
  },
  {
    id: 'bandeira-quadriculada',
    nome: 'Bandeira quadriculada',
    categoria: 'bandeiras',
    definicao: 'Fim da sessão ou da corrida. O primeiro a recebê-la na corrida é o vencedor.',
    relacionados: ['podio'],
  },
  {
    id: 'pontuacao',
    nome: 'Pontuação',
    categoria: 'regras',
    definicao:
      'Na corrida, os dez primeiros pontuam: 25, 18, 15, 12, 10, 8, 6, 4, 2 e 1. Na sprint, os oito primeiros, de 8 a 1. Quem soma mais pontos no ano é campeão.',
    relacionados: ['campeonato-de-construtores', 'sprint', 'volta-mais-rapida'],
    noSite: { texto: 'Classificação do campeonato atual', para: '/classificacao' },
  },
  {
    id: 'campeonato-de-construtores',
    nome: 'Campeonato de construtores',
    categoria: 'regras',
    definicao:
      'Disputa entre as equipes, que somam os pontos dos seus dois pilotos. Existe desde 1958 e define a divisão do dinheiro do campeonato.',
    relacionados: ['pontuacao', 'teto-de-gastos'],
    noSite: { texto: 'Campeões de cada ano na história da F1', para: '/historia' },
  },
  {
    id: 'penalidade-de-grid',
    nome: 'Penalidade de grid',
    categoria: 'regras',
    definicao:
      'Punição que faz o piloto largar posições atrás da conquistada na classificação, por exemplo por trocar peças da unidade de potência além do limite da temporada.',
    relacionados: ['grid-de-largada', 'unidade-de-potencia'],
  },
  {
    id: 'limites-de-pista',
    nome: 'Limites de pista',
    tambem: 'Track limits',
    categoria: 'regras',
    definicao:
      'As linhas brancas que marcam a pista. Sair delas por completo invalida a volta na classificação e, se repetido na corrida, gera punição.',
    relacionados: ['classificacao'],
  },
  {
    id: 'teto-de-gastos',
    nome: 'Teto de gastos',
    tambem: 'Cost cap',
    categoria: 'regras',
    definicao:
      'Limite anual de quanto cada equipe pode gastar para desenvolver e correr com os carros, em vigor desde 2021 para aproximar as grandes das pequenas.',
    relacionados: ['campeonato-de-construtores'],
  },
];
