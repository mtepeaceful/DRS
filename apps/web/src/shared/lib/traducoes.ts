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

const paises: Record<string, { nome: string; codigo: string }> = {
  Australia: { nome: 'Austrália', codigo: 'AU' },
  Austria: { nome: 'Áustria', codigo: 'AT' },
  Azerbaijan: { nome: 'Azerbaijão', codigo: 'AZ' },
  Bahrain: { nome: 'Bahrein', codigo: 'BH' },
  Belgium: { nome: 'Bélgica', codigo: 'BE' },
  Brazil: { nome: 'Brasil', codigo: 'BR' },
  Canada: { nome: 'Canadá', codigo: 'CA' },
  China: { nome: 'China', codigo: 'CN' },
  Hungary: { nome: 'Hungria', codigo: 'HU' },
  Italy: { nome: 'Itália', codigo: 'IT' },
  Japan: { nome: 'Japão', codigo: 'JP' },
  Malaysia: { nome: 'Malásia', codigo: 'MY' },
  Mexico: { nome: 'México', codigo: 'MX' },
  Monaco: { nome: 'Mônaco', codigo: 'MC' },
  Netherlands: { nome: 'Holanda', codigo: 'NL' },
  Qatar: { nome: 'Catar', codigo: 'QA' },
  'Saudi Arabia': { nome: 'Arábia Saudita', codigo: 'SA' },
  Singapore: { nome: 'Singapura', codigo: 'SG' },
  Spain: { nome: 'Espanha', codigo: 'ES' },
  UAE: { nome: 'Emirados Árabes', codigo: 'AE' },
  UK: { nome: 'Inglaterra', codigo: 'GB' },
  USA: { nome: 'Estados Unidos', codigo: 'US' },
};

export function nomeDoGp(nome: string) {
  return nomesDosGps[nome] ?? nome.replace(/ Grand Prix$/, ' GP');
}

export function nomeDoPaisEmPortugues(pais: string) {
  return paises[pais]?.nome ?? pais;
}

export function codigoDoPais(pais: string) {
  return paises[pais]?.codigo ?? '';
}

const nomesDasEquipes: Record<string, string> = {
  'Alpine F1 Team': 'Alpine',
  'Cadillac F1 Team': 'Cadillac',
  'Haas F1 Team': 'Haas',
  'RB F1 Team': 'Racing Bulls',
};

export function nomeDaEquipe(nome: string) {
  return nomesDasEquipes[nome] ?? nome;
}
