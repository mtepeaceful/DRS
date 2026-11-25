/**
 * Perfil das equipes do grid atual: dados que nenhuma API aberta publica
 * (Jolpica e OpenF1 não têm chefe de equipe, chassi, motor ou reservas).
 *
 * Fonte: páginas "Team Profile" do site oficial da F1 (formula1.com/en/teams),
 * conferidas na data de `PERFIS_ATUALIZADOS_EM`. Atualize a tabela quando o
 * grid mudar (nova temporada, troca de chefe ou de reserva).
 *
 * A chave é o `constructorId` da Jolpica, o mesmo id da rota /equipes/:id.
 */
export interface PerfilDaEquipe {
  temporada: number;
  nomeCompleto: string;
  sede: { cidade: string; pais: string };
  chefes: string[];
  chefesTecnicos: string[];
  chassi: string;
  motor: string;
  reservas: string[];
  primeiraInscricao: number;
  fonte: string;
}

export const PERFIS_ATUALIZADOS_EM = '2026-11-25';

const F1 = 'https://www.formula1.com/en/teams';

export const PERFIS_DO_GRID: Readonly<Record<string, PerfilDaEquipe>> = {
  mclaren: {
    temporada: 2026,
    nomeCompleto: 'McLaren Mastercard F1 Team',
    sede: { cidade: 'Woking', pais: 'GB' },
    chefes: ['Andrea Stella'],
    chefesTecnicos: ['Peter Prodromou', 'Neil Houldey'],
    chassi: 'MCL40',
    motor: 'Mercedes',
    reservas: ['Leonardo Fornaroli', 'Pato O’Ward'],
    primeiraInscricao: 1966,
    fonte: `${F1}/mclaren`,
  },
  ferrari: {
    temporada: 2026,
    nomeCompleto: 'Scuderia Ferrari HP',
    sede: { cidade: 'Maranello', pais: 'IT' },
    chefes: ['Frédéric Vasseur'],
    chefesTecnicos: ['Loic Serra', 'Enrico Gualtieri'],
    chassi: 'SF-26',
    motor: 'Ferrari',
    reservas: ['Antonio Giovinazzi'],
    primeiraInscricao: 1950,
    fonte: `${F1}/ferrari`,
  },
  red_bull: {
    temporada: 2026,
    nomeCompleto: 'Oracle Red Bull Racing',
    sede: { cidade: 'Milton Keynes', pais: 'GB' },
    chefes: ['Laurent Mekies'],
    chefesTecnicos: ['Pierre Waché'],
    chassi: 'RB22',
    motor: 'Red Bull Ford',
    reservas: ['Yuki Tsunoda'],
    primeiraInscricao: 1997,
    fonte: `${F1}/red-bull-racing`,
  },
  mercedes: {
    temporada: 2026,
    nomeCompleto: 'Mercedes-AMG PETRONAS Formula One Team',
    sede: { cidade: 'Brackley', pais: 'GB' },
    chefes: ['Toto Wolff'],
    chefesTecnicos: ['James Allison'],
    chassi: 'W17',
    motor: 'Mercedes',
    reservas: ['Fred Vesti'],
    primeiraInscricao: 1970,
    fonte: `${F1}/mercedes`,
  },
  aston_martin: {
    temporada: 2026,
    nomeCompleto: 'Aston Martin Aramco Formula One Team',
    sede: { cidade: 'Silverstone', pais: 'GB' },
    chefes: ['Adrian Newey'],
    chefesTecnicos: ['Enrico Cardile'],
    chassi: 'AMR26',
    motor: 'Honda',
    reservas: ['Jak Crawford'],
    primeiraInscricao: 2018,
    fonte: `${F1}/aston-martin`,
  },
  alpine: {
    temporada: 2026,
    nomeCompleto: 'BWT Alpine Formula One Team',
    sede: { cidade: 'Enstone', pais: 'GB' },
    chefes: ['Flavio Briatore', 'Steve Nielsen'],
    chefesTecnicos: ['David Sanchez'],
    chassi: 'A526',
    motor: 'Mercedes',
    reservas: ['Paul Aron', 'Kush Maini'],
    primeiraInscricao: 1986,
    fonte: `${F1}/alpine`,
  },
  williams: {
    temporada: 2026,
    nomeCompleto: 'Atlassian Williams F1 Team',
    sede: { cidade: 'Grove', pais: 'GB' },
    chefes: ['James Vowles'],
    chefesTecnicos: ['Pat Fry'],
    chassi: 'FW48',
    motor: 'Mercedes',
    reservas: [],
    primeiraInscricao: 1978,
    fonte: `${F1}/williams`,
  },
  rb: {
    temporada: 2026,
    nomeCompleto: 'Visa Cash App Racing Bulls Formula One Team',
    sede: { cidade: 'Faenza', pais: 'IT' },
    chefes: ['Alan Permane'],
    chefesTecnicos: ['Tim Goss'],
    chassi: 'VCARB 03',
    motor: 'Red Bull Ford',
    reservas: ['Yuki Tsunoda'],
    primeiraInscricao: 1985,
    fonte: `${F1}/racing-bulls`,
  },
  haas: {
    temporada: 2026,
    nomeCompleto: 'TGR Haas F1 Team',
    sede: { cidade: 'Kannapolis', pais: 'US' },
    chefes: ['Ayao Komatsu'],
    chefesTecnicos: ['Andrea De Zordo'],
    chassi: 'VF-26',
    motor: 'Ferrari',
    reservas: ['Jack Doohan', 'Ryo Hirakawa'],
    primeiraInscricao: 2016,
    fonte: `${F1}/haas`,
  },
  audi: {
    temporada: 2026,
    nomeCompleto: 'Audi Revolut F1 Team',
    sede: { cidade: 'Hinwil', pais: 'CH' },
    chefes: ['Mattia Binotto'],
    chefesTecnicos: ['James Key'],
    chassi: 'R26',
    motor: 'Audi',
    reservas: [],
    primeiraInscricao: 2026,
    fonte: `${F1}/audi`,
  },
  cadillac: {
    temporada: 2026,
    nomeCompleto: 'Cadillac Formula 1 Team',
    sede: { cidade: 'Silverstone', pais: 'GB' },
    chefes: ['Marcin Budkowski'],
    chefesTecnicos: ['Nick Chester'],
    chassi: 'MAC-26',
    motor: 'Ferrari',
    reservas: ['Zhou Guanyu'],
    primeiraInscricao: 2026,
    fonte: `${F1}/cadillac`,
  },
};
