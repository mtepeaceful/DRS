const nomesDosGps: Record<string, string> = {
  '70th Anniversary Grand Prix': 'GP do 70º Aniversário',
  'Abu Dhabi Grand Prix': 'GP de Abu Dhabi',
  'Argentine Grand Prix': 'GP da Argentina',
  'Australian Grand Prix': 'GP da Austrália',
  'Austrian Grand Prix': 'GP da Áustria',
  'Azerbaijan Grand Prix': 'GP do Azerbaijão',
  'Bahrain Grand Prix': 'GP do Bahrein',
  'Bahrain Grand Prix in Malaysia': 'GP do Bahrein (na Malásia)',
  'Barcelona Grand Prix': 'GP de Barcelona',
  'Belgian Grand Prix': 'GP da Bélgica',
  'Brazilian Grand Prix': 'GP de São Paulo',
  'British Grand Prix': 'GP da Inglaterra',
  'Caesars Palace Grand Prix': 'GP de Caesars Palace',
  'Canadian Grand Prix': 'GP do Canadá',
  'Chinese Grand Prix': 'GP da China',
  'Dallas Grand Prix': 'GP de Dallas',
  'Detroit Grand Prix': 'GP de Detroit',
  'Dutch Grand Prix': 'GP da Holanda',
  'Eifel Grand Prix': 'GP de Eifel',
  'Emilia Romagna Grand Prix': 'GP da Emília-Romanha',
  'European Grand Prix': 'GP da Europa',
  'French Grand Prix': 'GP da França',
  'German Grand Prix': 'GP da Alemanha',
  'Hungarian Grand Prix': 'GP da Hungria',
  'Indian Grand Prix': 'GP da Índia',
  'Indianapolis 500': '500 Milhas de Indianápolis',
  'Italian Grand Prix': 'GP da Itália',
  'Japanese Grand Prix': 'GP do Japão',
  'Korean Grand Prix': 'GP da Coreia',
  'Las Vegas Grand Prix': 'GP de Las Vegas',
  'Luxembourg Grand Prix': 'GP de Luxemburgo',
  'Madrid Grand Prix': 'GP de Madri',
  'Malaysian Grand Prix': 'GP da Malásia',
  'Mexican Grand Prix': 'GP do México',
  'Mexico City Grand Prix': 'GP da Cidade do México',
  'Miami Grand Prix': 'GP de Miami',
  'Monaco Grand Prix': 'GP de Mônaco',
  'Moroccan Grand Prix': 'GP do Marrocos',
  'Pacific Grand Prix': 'GP do Pacífico',
  'Pescara Grand Prix': 'GP de Pescara',
  'Portuguese Grand Prix': 'GP de Portugal',
  'Qatar Grand Prix': 'GP do Catar',
  'Russian Grand Prix': 'GP da Rússia',
  'Sakhir Grand Prix': 'GP de Sakhir',
  'San Marino Grand Prix': 'GP de San Marino',
  'Saudi Arabian Grand Prix': 'GP da Arábia Saudita',
  'Singapore Grand Prix': 'GP de Singapura',
  'South African Grand Prix': 'GP da África do Sul',
  'Spanish Grand Prix': 'GP da Espanha',
  'Styrian Grand Prix': 'GP da Estíria',
  'Swedish Grand Prix': 'GP da Suécia',
  'Swiss Grand Prix': 'GP da Suíça',
  'Turkish Grand Prix': 'GP da Turquia',
  'Tuscan Grand Prix': 'GP da Toscana',
  'United States Grand Prix': 'GP dos Estados Unidos',
  'United States Grand Prix West': 'GP dos Estados Unidos-Oeste',
  'Vietnamese Grand Prix': 'GP do Vietnã',
};

const paises: Record<string, { nome: string; codigo: string }> = {
  Argentina: { nome: 'Argentina', codigo: 'AR' },
  Australia: { nome: 'Austrália', codigo: 'AU' },
  Austria: { nome: 'Áustria', codigo: 'AT' },
  Azerbaijan: { nome: 'Azerbaijão', codigo: 'AZ' },
  Bahrain: { nome: 'Bahrein', codigo: 'BH' },
  Belgium: { nome: 'Bélgica', codigo: 'BE' },
  Brazil: { nome: 'Brasil', codigo: 'BR' },
  Canada: { nome: 'Canadá', codigo: 'CA' },
  China: { nome: 'China', codigo: 'CN' },
  France: { nome: 'França', codigo: 'FR' },
  Germany: { nome: 'Alemanha', codigo: 'DE' },
  Hungary: { nome: 'Hungria', codigo: 'HU' },
  India: { nome: 'Índia', codigo: 'IN' },
  Italy: { nome: 'Itália', codigo: 'IT' },
  Japan: { nome: 'Japão', codigo: 'JP' },
  Korea: { nome: 'Coreia do Sul', codigo: 'KR' },
  Malaysia: { nome: 'Malásia', codigo: 'MY' },
  Mexico: { nome: 'México', codigo: 'MX' },
  Monaco: { nome: 'Mônaco', codigo: 'MC' },
  Morocco: { nome: 'Marrocos', codigo: 'MA' },
  Netherlands: { nome: 'Holanda', codigo: 'NL' },
  Portugal: { nome: 'Portugal', codigo: 'PT' },
  Qatar: { nome: 'Catar', codigo: 'QA' },
  Russia: { nome: 'Rússia', codigo: 'RU' },
  'Saudi Arabia': { nome: 'Arábia Saudita', codigo: 'SA' },
  Singapore: { nome: 'Singapura', codigo: 'SG' },
  'South Africa': { nome: 'África do Sul', codigo: 'ZA' },
  Spain: { nome: 'Espanha', codigo: 'ES' },
  Sweden: { nome: 'Suécia', codigo: 'SE' },
  Switzerland: { nome: 'Suíça', codigo: 'CH' },
  Turkey: { nome: 'Turquia', codigo: 'TR' },
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
