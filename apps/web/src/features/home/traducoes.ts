const nomesDosGps: Record<string, string> = {
  'Abu Dhabi Grand Prix': 'GP de Abu Dhabi',
  'Australian Grand Prix': 'GP da Austrália',
  'Austrian Grand Prix': 'GP da Áustria',
  'Azerbaijan Grand Prix': 'GP do Azerbaijão',
  'Bahrain Grand Prix': 'GP do Bahrein',
  'Bahrain Grand Prix in Malaysia': 'GP do Bahrein (na Malásia)',
  'Barcelona Grand Prix': 'GP de Barcelona',
  'Belgian Grand Prix': 'GP da Bélgica',
  'Brazilian Grand Prix': 'GP de São Paulo',
  'British Grand Prix': 'GP da Inglaterra',
  'Canadian Grand Prix': 'GP do Canadá',
  'Chinese Grand Prix': 'GP da China',
  'Dutch Grand Prix': 'GP da Holanda',
  'Emilia Romagna Grand Prix': 'GP da Emília-Romanha',
  'Hungarian Grand Prix': 'GP da Hungria',
  'Italian Grand Prix': 'GP da Itália',
  'Japanese Grand Prix': 'GP do Japão',
  'Las Vegas Grand Prix': 'GP de Las Vegas',
  'Madrid Grand Prix': 'GP de Madri',
  'Mexico City Grand Prix': 'GP da Cidade do México',
  'Miami Grand Prix': 'GP de Miami',
  'Monaco Grand Prix': 'GP de Mônaco',
  'Qatar Grand Prix': 'GP do Catar',
  'Saudi Arabian Grand Prix': 'GP da Arábia Saudita',
  'Singapore Grand Prix': 'GP de Singapura',
  'Spanish Grand Prix': 'GP da Espanha',
  'United States Grand Prix': 'GP dos Estados Unidos',
};

const paises: Record<string, string> = {
  Australia: 'Austrália',
  Austria: 'Áustria',
  Azerbaijan: 'Azerbaijão',
  Bahrain: 'Bahrein',
  Belgium: 'Bélgica',
  Brazil: 'Brasil',
  Canada: 'Canadá',
  China: 'China',
  Hungary: 'Hungria',
  Italy: 'Itália',
  Japan: 'Japão',
  Malaysia: 'Malásia',
  Mexico: 'México',
  Monaco: 'Mônaco',
  Netherlands: 'Holanda',
  Qatar: 'Catar',
  'Saudi Arabia': 'Arábia Saudita',
  Singapore: 'Singapura',
  Spain: 'Espanha',
  UAE: 'Emirados Árabes',
  UK: 'Inglaterra',
  USA: 'Estados Unidos',
};

export function nomeDoGp(nome: string) {
  return nomesDosGps[nome] ?? nome.replace(/ Grand Prix$/, ' GP');
}

export function nomeDoPaisEmPortugues(pais: string) {
  return paises[pais] ?? pais;
}

const nomesDasEquipes: Record<string, string> = {
  'Alpine F1 Team': 'Alpine',
  'Cadillac F1 Team': 'Cadillac',
  'RB F1 Team': 'Racing Bulls',
};

export function nomeDaEquipe(nome: string) {
  return nomesDasEquipes[nome] ?? nome;
}
