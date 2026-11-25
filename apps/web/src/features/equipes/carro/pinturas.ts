import { chaveDaEquipe, type CoresDaEquipe } from '../../../shared/lib/equipe';
import type { Pintura } from './tipos';

/*
 * As pinturas de 2026, desenhadas à mão por cima da mesma carroceria.
 * Os patrocínios são texto e formas simples, não as logos oficiais.
 */

const FONTE = "'Manrope Variable', 'Manrope', system-ui, sans-serif";

const NUMERO_CLARO = { cor: '#ffffff', contorno: '#0b0b0d' };
const NUMERO_ESCURO = { cor: '#0b0b0d', contorno: '#ffffff' };

const texto = (x: number, y: number, tamanho: number, cor: string, conteudo: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONTE}" font-weight="800" font-size="${tamanho}" fill="${cor}" text-anchor="middle"${extra}>${conteudo}</text>`;

const mastercard = (x: number, y: number) => `
  <circle cx="${x - 5}" cy="${y}" r="7" fill="#eb001b"/>
  <circle cx="${x + 5}" cy="${y}" r="7" fill="#f79e1b"/>
  <path d="M${x} ${y - 5} A7 7 0 0 1 ${x} ${y + 5} A7 7 0 0 1 ${x} ${y - 5}Z" fill="#ff5f00"/>`;

const hp = (x: number, y: number, r: number) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="#0096d6"/>
  <text x="${x}" y="${y + r * 0.36}" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="${r * 1.15}" fill="#fff" text-anchor="middle">hp</text>`;

const shell = (x: number, y: number) => `
  <path d="M${x - 10} ${y + 7} L${x - 12} ${y - 2} A12 12 0 0 1 ${x + 12} ${y - 2} L${x + 10} ${y + 7} Z" fill="#fbce07" stroke="#dd1d21" stroke-width="1.8"/>
  <path d="M${x} ${y + 6} L${x - 7} ${y - 5} M${x} ${y + 6} L${x} ${y - 9} M${x} ${y + 6} L${x + 7} ${y - 5}" stroke="#dd1d21" stroke-width="1.3"/>`;

const BOI =
  'M0 2 L-4 -4 L-2 -11 L-7 -6 L-12 -9 C-22 -11 -32 -9 -38 -4 L-47 -9 L-41 -1 L-38 6 L-43 12 L-34 9 L-30 4 L-18 4 L-15 11 L-8 12 L-10 6 L-6 4 Z';

/** Dois touros se encarando na frente de um sol amarelo. */
const touros = (x: number, y: number, escala: number, cor = '#d8102b') => `
  <g transform="translate(${x} ${y}) scale(${escala})">
    <circle cx="0" cy="-3" r="11" fill="#ffcc00"/>
    <path d="${BOI}" transform="translate(-3 0)" fill="${cor}"/>
    <path d="${BOI}" transform="translate(3 0) scale(-1 1)" fill="${cor}"/>
  </g>`;

const estrela = (x: number, y: number, cor: string) =>
  `<path d="M${x} ${y + 12} Q${x + 2} ${y + 2} ${x + 10} ${y} Q${x + 2} ${y - 2} ${x} ${y - 12} Q${x - 2} ${y - 2} ${x - 10} ${y} Q${x - 2} ${y + 2} ${x} ${y + 12}Z" fill="${cor}"/>`;

const argolas = (x: number, y: number, cor: string) =>
  [0, 1, 2, 3]
    .map(
      (i) =>
        `<circle cx="${x + i * 11}" cy="${y}" r="7" fill="none" stroke="${cor}" stroke-width="2"/>`,
    )
    .join('');

const RODA_PRETA = { raios: '#26262b' };

const PINTURAS: Record<string, Pintura> = {
  mclaren: {
    base: '#ff8000',
    tampa: '#1d1f24',
    capacete: '#d6ff00',
    capaceteDetalhe:
      '<path d="M463 124 Q476 118 489 124" stroke="#111" stroke-width="2.5" fill="none"/>',
    aro: {
      fundo: '#141417',
      raios: '#2c2d33',
      anel: [
        '#4285f4',
        '#3f8ff0',
        '#34a853',
        '#7cb342',
        '#fbbc04',
        '#f9a825',
        '#ea4335',
        '#d93a6a',
        '#a142f4',
        '#6e6ef0',
      ].flatMap((cor) => [cor, cor, cor]),
      larguraDoAnel: 5,
      centro: '#141417',
      borda: '#2a2b30',
    },
    numero: NUMERO_CLARO,
    asaTraseira: '#ff8000',
    flap: '#ff8000',
    endplate: '#1b1d22',
    flapDianteiro: '#ff8000',
    pinturaCorpo: `
      <path d="M100 140 L460 60 L560 60 L560 146 C470 146 380 162 300 178 L100 212 Z" fill="#1d1f24"/>
      <path d="M100 212 L300 178 C380 162 470 146 560 146 L560 150 C470 150 380 166 300 182 L100 216 Z" fill="#ff8000" opacity=".9"/>
      <path d="M600 150 C700 170 820 196 960 206 L960 212 C820 204 700 178 600 160 Z" fill="#1d1f24"/>`,
    pinturaPod:
      '<path d="M380 140 L606 140 L606 166 C520 162 430 166 360 176 L240 198 L150 198 L150 180 Z" fill="#1d1f24"/>',
    marcas: [
      {
        x: 330,
        y: 164,
        giro: -16,
        svg: estrela(318, 166, '#7a86ff') + texto(366, 172, 21, '#fff', 'Gemini'),
      },
      { x: 470, y: 196, texto: 'OKX', tamanho: 20, cor: '#1d1f24', peso: 900, espaco: 2 },
      { x: 545, y: 160, texto: 'cisco', tamanho: 13, cor: '#fff', peso: 700 },
      { x: 405, y: 196, texto: 'DELL', tamanho: 12, cor: '#1d1f24', peso: 900, espaco: 1 },
      { x: 368, y: 128, texto: 'allwyn', tamanho: 11, cor: '#3fe0c5', giro: -30 },
      {
        x: 680,
        y: 188,
        texto: 'VELO',
        tamanho: 12,
        cor: '#1d1f24',
        peso: 900,
        giro: 9,
        espaco: 1.5,
      },
      { x: 350, y: 194, svg: mastercard(350, 194) },
    ],
    asa: texto(110, 142, 11, '#1d1f24', 'Dropbox'),
    frente: texto(972, 256, 8, '#fff', 'workday', ' transform="rotate(-90 972 256)"'),
  },

  ferrari: {
    base: '#e10600',
    capacete: '#ffd700',
    capaceteDetalhe: '<path d="M463 126 L489 126" stroke="#e10600" stroke-width="3"/>',
    aro: RODA_PRETA,
    numero: NUMERO_CLARO,
    flap: '#f4efe6',
    flapDianteiro: '#f4efe6',
    pinturaCorpo: `
      <path d="M300 196 C340 140 370 90 400 40 L700 40 L700 168 C620 152 540 150 460 156 C400 162 350 176 300 196 Z" fill="#f4efe6"/>
      <path d="M100 210 L960 210 L960 260 L100 260 Z" fill="#000" opacity=".25"/>`,
    pinturaPod: `
      <path d="M356 196 L400 140 L620 140 L620 176 C540 170 460 172 400 182 Z" fill="#f4efe6"/>
      <path d="M356 196 L400 182 C460 172 540 170 620 176 L620 179 C540 173 460 175 400 185 L354 199 Z" fill="#111"/>`,
    marcas: [
      { x: 430, y: 150, svg: hp(430, 150, 16) },
      { x: 520, y: 164, texto: 'IBM', tamanho: 12, cor: '#1f70c1', peso: 900, espaco: 2 },
      { x: 575, y: 164, texto: 'ZYN', tamanho: 12, cor: '#111', peso: 900, espaco: 1 },
      { x: 330, y: 194, svg: shell(330, 194) },
      { x: 450, y: 196, texto: 'ceva', tamanho: 16, cor: '#fff', espaco: 2 },
      { x: 535, y: 190, texto: 'ambipar', tamanho: 14, cor: '#fff', peso: 600 },
      { x: 690, y: 183, texto: 'UniCredit', tamanho: 11, cor: '#fff', giro: 9 },
    ],
    asa: `
      ${texto(110, 128, 10, '#fff', 'V-Power', ' font-style="italic"')}
      <text x="110" y="150" font-family="Georgia, serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">Peroni</text>`,
  },

  'red-bull-racing': {
    base: '#1c2747',
    capacete: '#1c2747',
    capaceteDetalhe:
      '<path d="M463 128 Q476 120 489 126" stroke="#d8102b" stroke-width="3" fill="none"/><circle cx="470" cy="118" r="3" fill="#ffcc00"/>',
    aro: { raios: '#26262b', borda: '#3a6df0', anel: ['#2e5bd6'], larguraDoAnel: 3 },
    numero: NUMERO_CLARO,
    flap: '#1c2747',
    flapDianteiro: '#1c2747',
    pinturaCorpo: `
      <path d="M880 200 L960 200 L960 232 L870 232 Z" fill="#d8102b"/>
      <path d="M860 200 L880 200 L870 232 L850 232 Z" fill="#ffcc00"/>`,
    marcas: [
      { x: 330, y: 168, svg: touros(330, 168, 1.15) },
      { x: 330, y: 198, texto: 'Red Bull', tamanho: 16, cor: '#d8102b', peso: 900, giro: -4 },
      { x: 490, y: 186, texto: 'ORACLE', tamanho: 24, cor: '#fff', peso: 500, espaco: 3 },
      { x: 540, y: 156, texto: 'ROKT', tamanho: 11, cor: '#fff', peso: 900, espaco: 1 },
      { x: 440, y: 160, texto: 'CARLYLE', tamanho: 10, cor: '#fff', peso: 600, espaco: 2 },
      {
        x: 660,
        y: 178,
        texto: 'Ford',
        tamanho: 13,
        cor: '#fff',
        peso: 700,
        italico: true,
        serifa: true,
        giro: 9,
      },
    ],
    asa: `
      <path d="M86 106 L136 102 L137 122 L87 126 Z" fill="#fff"/>
      <text x="111" y="118" font-family="${FONTE}" font-weight="900" font-size="12" fill="#0a2c6b" text-anchor="middle">Mobil<tspan fill="#d8102b">1</tspan></text>
      ${texto(112, 152, 9, '#fff', 'Hard Rock')}`,
  },

  mercedes: {
    base: '#15171a',
    capacete: '#e8e8ea',
    capaceteDetalhe:
      '<path d="M463 126 Q476 120 489 126" stroke="#00d2be" stroke-width="3" fill="none"/>',
    aro: { raios: '#2a2b30' },
    numero: { cor: '#ffffff', contorno: '#00a19c' },
    flapDianteiro: '#c9ccd1',
    pinturaCorpo: `
      <path d="M560 160 C680 175 820 200 960 214 L960 222 C820 210 680 186 560 172 Z" fill="#00d2be"/>
      <path d="M120 218 C220 200 300 190 380 186 L380 192 C300 198 220 208 120 226 Z" fill="#00d2be"/>
      <path d="M380 70 L470 60 L380 200 L340 200 Z" fill="#c9ccd1" opacity=".2"/>`,
    pinturaPod: `
      <path d="M150 200 C260 178 420 164 606 168 L606 174 C420 172 260 186 150 208 Z" fill="#00d2be"/>
      <path d="M300 160 L340 160 L280 230 L250 230 Z" fill="#c9ccd1" opacity=".18"/>
      <path d="M360 160 L380 160 L320 230 L305 230 Z" fill="#c9ccd1" opacity=".14"/>`,
    marcas: [
      { x: 450, y: 192, texto: 'PETRONAS', tamanho: 21, cor: '#fff', peso: 900, espaco: 1 },
      { x: 520, y: 156, texto: 'Microsoft', tamanho: 11, cor: '#fff', peso: 600 },
      { x: 372, y: 121, texto: 'TeamViewer', tamanho: 10, cor: '#fff', giro: -5 },
      { x: 670, y: 178, texto: 'IWC', tamanho: 11, cor: '#fff', peso: 900, giro: 9, espaco: 2 },
    ],
    asa: texto(111, 142, 10, '#00d2be', 'PETRONAS'),
  },

  'aston-martin': {
    base: '#0d5c46',
    capacete: '#cedc00',
    capaceteDetalhe:
      '<path d="M463 126 Q476 120 489 126" stroke="#0d5c46" stroke-width="3" fill="none"/>',
    aro: RODA_PRETA,
    numero: { cor: '#cedc00', contorno: '#07261d' },
    pinturaCorpo:
      '<path d="M560 166 C680 180 820 200 960 212 L960 216 C820 206 680 186 560 172 Z" fill="#cedc00"/>',
    pinturaPod:
      '<path d="M150 200 C260 186 420 178 606 178 L606 184 C420 184 260 192 150 206 Z" fill="#cedc00"/>',
    marcas: [
      { x: 470, y: 172, texto: 'aramco', tamanho: 26, cor: '#fff' },
      { x: 335, y: 186, texto: 'Powered by', tamanho: 8, cor: '#fff', peso: 600, giro: -8 },
      { x: 337, y: 198, texto: 'Honda', tamanho: 13, cor: '#fff', giro: -8 },
      { x: 372, y: 121, texto: 'MAADEN', tamanho: 11, cor: '#fff', espaco: 1, giro: -5 },
      { x: 560, y: 158, texto: 'BOSS', tamanho: 12, cor: '#fff', peso: 900, espaco: 1.5 },
      { x: 520, y: 196, texto: 'PROFORCE+', tamanho: 8, cor: '#fff' },
      { x: 680, y: 184, texto: 'cognizant', tamanho: 9, cor: '#fff', peso: 700, giro: 9 },
    ],
    asa: texto(110, 142, 11, '#fff', 'coinbase'),
  },

  williams: {
    base: '#0b1f4b',
    capacete: '#00a3e0',
    aro: RODA_PRETA,
    numero: NUMERO_CLARO,
    flapDianteiro: '#00a3e0',
    pinturaCorpo:
      '<path d="M560 162 C680 178 820 200 960 212 L960 218 C820 206 680 184 560 170 Z" fill="#00a3e0"/>',
    pinturaPod:
      '<path d="M150 200 C260 184 420 176 606 176 L606 182 C420 182 260 190 150 206 Z" fill="#00a3e0"/>',
    marcas: [
      { x: 470, y: 170, texto: 'ATLASSIAN', tamanho: 20, cor: '#fff', peso: 900, espaco: 1 },
      { x: 372, y: 121, texto: 'Santander', tamanho: 12, cor: '#ff4a4a', giro: -5 },
      { x: 520, y: 198, texto: 'Komatsu', tamanho: 11, cor: '#fff' },
      { x: 680, y: 184, texto: 'Gulf', tamanho: 12, cor: '#ff8c1a', peso: 900, giro: 9 },
    ],
    asa: texto(110, 142, 9, '#fff', 'ATLASSIAN'),
  },

  alpine: {
    base: '#0f4fa8',
    capacete: '#ff87bc',
    aro: RODA_PRETA,
    numero: NUMERO_CLARO,
    tampa: '#0b0c10',
    flapDianteiro: '#ff87bc',
    endplate: '#0b0c10',
    pinturaCorpo: `
      <path d="M100 150 L460 60 L560 60 L560 146 C470 146 380 162 300 178 L100 212 Z" fill="#0b0c10"/>
      <path d="M600 156 C700 174 820 198 960 210 L960 216 C820 206 700 182 600 164 Z" fill="#ff87bc"/>`,
    pinturaPod: `
      <path d="M380 140 L606 140 L606 160 C520 158 430 162 360 172 L150 196 L150 180 Z" fill="#0b0c10"/>
      <path d="M150 196 L360 172 C430 162 520 158 606 160 L606 166 C520 164 430 168 360 178 L150 202 Z" fill="#ff87bc"/>`,
    marcas: [
      { x: 480, y: 194, texto: 'ALPINE', tamanho: 20, cor: '#fff', peso: 900, espaco: 3 },
      { x: 372, y: 121, texto: 'MercadoLibre', tamanho: 11, cor: '#ffe600', giro: -5 },
    ],
    asa: texto(110, 142, 10, '#ff87bc', 'ALPINE'),
  },

  'racing-bulls': {
    base: '#f2f4f8',
    capacete: '#1634cc',
    aro: RODA_PRETA,
    numero: NUMERO_ESCURO,
    tampa: '#1634cc',
    flapDianteiro: '#1634cc',
    endplate: '#1634cc',
    asaTraseira: '#1634cc',
    pinturaCorpo:
      '<path d="M600 168 C700 184 820 204 960 214 L960 232 L600 232 Z" fill="#1634cc"/>',
    pinturaPod: '<path d="M150 196 C260 180 420 174 606 172 L606 220 L150 220 Z" fill="#1634cc"/>',
    marcas: [
      {
        x: 470,
        y: 196,
        texto: 'VISA',
        tamanho: 20,
        cor: '#fff',
        peso: 900,
        italico: true,
        espaco: 1,
      },
      { x: 330, y: 166, svg: touros(330, 166, 0.9) },
      { x: 520, y: 162, texto: 'cash app', tamanho: 12, cor: '#00b84d' },
      { x: 372, y: 121, texto: 'Red Bull', tamanho: 12, cor: '#fff', giro: -5 },
    ],
    asa: texto(110, 142, 11, '#fff', 'VISA'),
  },

  'haas-f1-team': {
    base: '#f2f2f2',
    capacete: '#e6002b',
    aro: RODA_PRETA,
    numero: NUMERO_ESCURO,
    tampa: '#121214',
    asaTraseira: '#121214',
    endplate: '#e6002b',
    flapDianteiro: '#121214',
    pinturaCorpo:
      '<path d="M100 200 L960 200 L960 260 L100 260 Z" fill="#121214"/><path d="M600 170 C700 186 820 204 960 212 L960 218 C820 210 700 192 600 176 Z" fill="#e6002b"/>',
    pinturaPod:
      '<path d="M150 200 C260 186 420 180 606 178 L606 230 L150 230 Z" fill="#121214"/><path d="M150 196 C260 182 420 176 606 174 L606 180 C420 182 260 188 150 202 Z" fill="#e6002b"/>',
    marcas: [
      { x: 480, y: 168, texto: 'TOYOTA GAZOO Racing', tamanho: 14, cor: '#121214', peso: 900 },
      { x: 480, y: 200, texto: 'HAAS', tamanho: 16, cor: '#fff', peso: 900, espaco: 3 },
      { x: 372, y: 121, texto: 'TGR', tamanho: 12, cor: '#fff', peso: 900, giro: -5 },
    ],
    asa: texto(110, 142, 11, '#fff', 'HAAS'),
  },

  audi: {
    base: '#b9bcc0',
    capacete: '#f50537',
    aro: RODA_PRETA,
    numero: NUMERO_CLARO,
    tampa: '#121214',
    asaTraseira: '#121214',
    endplate: '#121214',
    flapDianteiro: '#121214',
    pinturaCorpo:
      '<path d="M100 120 L380 60 L420 240 L100 240 Z" fill="#121214"/><path d="M600 168 C700 184 820 204 960 212 L960 216 C820 208 700 190 600 174 Z" fill="#f50537"/>',
    pinturaPod:
      '<path d="M150 140 L360 140 L330 240 L150 240 Z" fill="#121214"/><path d="M360 140 L368 140 L338 240 L330 240 Z" fill="#f50537"/>',
    marcas: [
      { x: 490, y: 186, texto: 'Revolut', tamanho: 22, cor: '#121214', peso: 800 },
      { x: 472, y: 160, svg: argolas(472, 160, '#121214') },
      { x: 372, y: 121, texto: 'AUDI', tamanho: 12, cor: '#fff', peso: 900, espaco: 2, giro: -5 },
    ],
    asa: texto(110, 142, 10, '#fff', 'Revolut'),
  },

  cadillac: {
    base: '#f2f2f2',
    capacete: '#121214',
    aro: RODA_PRETA,
    numero: NUMERO_ESCURO,
    tampa: '#121214',
    asaTraseira: '#121214',
    endplate: '#121214',
    flapDianteiro: '#121214',
    pinturaCorpo: '<path d="M100 60 L520 60 L380 240 L100 240 Z" fill="#121214"/>',
    pinturaPod: '<path d="M150 140 L470 140 L400 240 L150 240 Z" fill="#121214"/>',
    marcas: [
      { x: 520, y: 190, texto: 'CADILLAC', tamanho: 18, cor: '#121214', peso: 900, espaco: 3 },
      { x: 372, y: 121, texto: 'TWG', tamanho: 12, cor: '#fff', peso: 900, espaco: 2, giro: -5 },
    ],
    asa: texto(110, 142, 9, '#fff', 'CADILLAC'),
  },
};

/** Pintura de uma equipe que ainda não tem a dela: só as duas cores. */
function pinturaGenerica({ cor, corSecundaria }: CoresDaEquipe): Pintura {
  return {
    base: cor,
    capacete: corSecundaria,
    aro: RODA_PRETA,
    numero: NUMERO_CLARO,
    pinturaPod: `<path d="M150 196 C260 180 420 174 606 172 L606 180 C420 182 260 188 150 204 Z" fill="${corSecundaria}"/>`,
    pinturaCorpo: `<path d="M600 162 C700 178 820 200 960 212 L960 218 C820 208 700 186 600 170 Z" fill="${corSecundaria}"/>`,
  };
}

export function pinturaDaEquipe(nome: string, cores: CoresDaEquipe) {
  return PINTURAS[chaveDaEquipe(nome)] ?? pinturaGenerica(cores);
}
