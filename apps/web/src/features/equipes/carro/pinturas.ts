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
      <path d="M600 150 C700 170 820 196 976 224 L976 230 C820 204 700 178 600 160 Z" fill="#1d1f24"/>`,
    pinturaPod:
      '<path d="M380 140 L606 140 L606 166 C520 162 430 166 360 176 L240 198 L150 198 L150 180 Z" fill="#1d1f24"/>',
    marcas: [
      {
        x: 330,
        y: 164,
        giro: -16,
        svg: estrela(318, 166, '#7a86ff') + texto(366, 172, 21, '#fff', 'Gemini'),
      },
      { x: 470, y: 200, texto: 'OKX', tamanho: 20, cor: '#1d1f24', peso: 900, espaco: 2, giro: -4 },
      { x: 520, y: 157, texto: 'cisco', tamanho: 13, cor: '#fff', peso: 700, giro: -6 },
      {
        x: 395,
        y: 203,
        texto: 'DELL',
        tamanho: 12,
        cor: '#1d1f24',
        peso: 900,
        espaco: 1,
        giro: -4,
      },
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
      { x: 335, y: 203, svg: mastercard(335, 203), giro: -4 },
    ],
    asa: texto(110, 142, 11, '#1d1f24', 'Dropbox'),
    frente: texto(946, 250, 6, '#fff', 'workday'),
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
      <path d="M300 196 C340 140 370 90 400 40 L760 40 L760 173 C680 156 540 150 460 156 C400 162 350 176 300 196 Z" fill="#f4efe6"/>
      <path d="M100 210 L960 210 L960 260 L100 260 Z" fill="#000" opacity=".25"/>`,
    pinturaPod: `
      <path d="M356 196 L400 140 L620 140 L620 176 C540 170 460 172 400 182 Z" fill="#f4efe6"/>
      <path d="M356 196 L400 182 C460 172 540 170 620 176 L620 179 C540 173 460 175 400 185 L354 199 Z" fill="#111"/>`,
    marcas: [
      { x: 345, y: 158, svg: hp(345, 158, 16), giro: -6 },
      { x: 470, y: 148, texto: 'IBM', tamanho: 12, cor: '#1f70c1', peso: 900, espaco: 2, giro: -6 },
      { x: 540, y: 155, texto: 'ZYN', tamanho: 12, cor: '#111', peso: 900, espaco: 1, giro: -6 },
      { x: 290, y: 208, svg: shell(290, 208), giro: -4 },
      { x: 420, y: 202, texto: 'ceva', tamanho: 16, cor: '#fff', espaco: 2, giro: -4 },
      { x: 510, y: 195, texto: 'ambipar', tamanho: 14, cor: '#fff', peso: 600, giro: -4 },
      { x: 648, y: 178, texto: 'UniCredit', tamanho: 10, cor: '#fff', giro: 7 },
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
      <path d="M880 196 L980 196 L980 260 L870 260 Z" fill="#d8102b"/>
      <path d="M860 196 L880 196 L870 260 L850 260 Z" fill="#ffcc00"/>`,
    marcas: [
      { x: 298, y: 154, svg: touros(298, 154, 0.85), giro: -7 },
      { x: 374, y: 161, texto: 'Red Bull', tamanho: 16, cor: '#d8102b', peso: 900, giro: -8 },
      { x: 470, y: 201, texto: 'ORACLE', tamanho: 24, cor: '#fff', peso: 500, espaco: 3, giro: -4 },
      { x: 545, y: 155, texto: 'ROKT', tamanho: 11, cor: '#fff', peso: 900, espaco: 1, giro: -6 },
      {
        x: 470,
        y: 161,
        texto: 'CARLYLE',
        tamanho: 10,
        cor: '#fff',
        peso: 600,
        espaco: 2,
        giro: -6,
      },
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
      <path d="M560 160 C680 175 820 200 976 232 L976 240 C820 210 680 186 560 172 Z" fill="#00d2be"/>
      <path d="M120 218 C220 200 300 190 380 186 L380 192 C300 198 220 208 120 226 Z" fill="#00d2be"/>
      <path d="M380 70 L470 60 L380 200 L340 200 Z" fill="#c9ccd1" opacity=".2"/>`,
    pinturaPod: `
      <path d="M150 200 C260 178 420 164 606 168 L606 174 C420 172 260 186 150 208 Z" fill="#00d2be"/>
      <path d="M300 160 L340 160 L280 230 L250 230 Z" fill="#c9ccd1" opacity=".18"/>
      <path d="M360 160 L380 160 L320 230 L305 230 Z" fill="#c9ccd1" opacity=".14"/>`,
    marcas: [
      {
        x: 450,
        y: 202,
        texto: 'PETRONAS',
        tamanho: 21,
        cor: '#fff',
        peso: 900,
        espaco: 1,
        giro: -4,
      },
      { x: 520, y: 156, texto: 'Microsoft', tamanho: 11, cor: '#fff', peso: 600, giro: -6 },
      { x: 345, y: 160, texto: 'TeamViewer', tamanho: 15, cor: '#fff', giro: -7 },
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
      '<path d="M560 166 C680 180 820 200 976 230 L976 234 C820 206 680 186 560 172 Z" fill="#cedc00"/>',
    pinturaPod:
      '<path d="M150 200 C260 186 420 178 606 178 L606 184 C420 184 260 192 150 206 Z" fill="#cedc00"/>',
    marcas: [
      { x: 470, y: 202, texto: 'aramco', tamanho: 26, cor: '#fff', giro: -4 },
      { x: 330, y: 198, texto: 'Powered by', tamanho: 8, cor: '#fff', peso: 600, giro: -4 },
      { x: 332, y: 214, texto: 'Honda', tamanho: 13, cor: '#fff', giro: -4 },
      { x: 340, y: 160, texto: 'MAADEN', tamanho: 16, cor: '#fff', espaco: 1, giro: -7 },
      { x: 545, y: 155, texto: 'BOSS', tamanho: 12, cor: '#fff', peso: 900, espaco: 1.5, giro: -6 },
      { x: 460, y: 162, texto: 'PROFORCE+', tamanho: 8, cor: '#fff', giro: -6 },
      { x: 680, y: 184, texto: 'cognizant', tamanho: 9, cor: '#fff', peso: 700, giro: 9 },
    ],
    asa: texto(110, 142, 11, '#fff', 'coinbase'),
  },

  williams: {
    base: '#2342e0',
    capacete: '#1b2a8f',
    aro: {
      raiosFinos: true,
      raios: '#34343a',
      blocos: { cores: ['#9b4dff', '#f1f1f4'], quantidade: 20, largura: 7 },
    },
    numero: NUMERO_CLARO,
    airbox: '#c97a2a',
    asaTraseira: '#2342e0',
    flapDianteiro: '#111318',
    endplate: '#111318',
    pinturaTampa: '<path d="M377 101 L452 90 L452 124 C430 124 400 122 377 121 Z" fill="#0c0e16"/>',
    pinturaCorpo: `
      <path d="M600 176 L760 182 L800 196 L800 230 L600 230 Z" fill="#0c0e16"/>
      <path d="M860 214 C920 226 960 236 1000 244 L1000 270 L860 270 Z" fill="#0c0e16"/>`,
    sidepod: '#f2f4f8',
    pinturaPod: '<path d="M440 150 L640 150 L640 240 L400 240 Z" fill="#41b6e6"/>',
    marcas: [
      {
        x: 335,
        y: 162,
        texto: 'ATLASSIAN',
        tamanho: 18,
        cor: '#fff',
        peso: 900,
        espaco: 1,
        giro: -7,
      },
      { x: 368, y: 206, texto: 'KOMATSU', tamanho: 15, cor: '#1b2a8f', peso: 900, giro: -2 },
      { x: 505, y: 196, texto: 'BARCLAYS', tamanho: 14, cor: '#fff', peso: 700, giro: -6 },
      { x: 452, y: 154, texto: 'kraken  Claude', tamanho: 9, cor: '#fff', peso: 700, giro: -7 },
      { x: 425, y: 108, texto: 'DURACELL', tamanho: 9, cor: '#fff', peso: 900, giro: -5 },
      { x: 690, y: 170, texto: 'brillio', tamanho: 10, cor: '#fff', peso: 800, giro: 5 },
      { x: 700, y: 194, texto: 'Stephens', tamanho: 10, cor: '#fff', serifa: true, giro: 3 },
      { x: 962, y: 238, texto: 'betway', tamanho: 8, cor: '#fff', peso: 900, giro: 12 },
    ],
    asa: `<path d="M64 140 L149 140 L148 160 L126 162 L112 196 L96 196 Z" fill="#f2f4f8"/>${texto(104, 124, 12, '#fff', 'KOMATSU')}`,
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
      <path d="M600 156 C700 174 820 198 976 228 L976 234 C820 206 700 182 600 164 Z" fill="#ff87bc"/>`,
    pinturaPod: `
      <path d="M380 140 L606 140 L606 160 C520 158 430 162 360 172 L150 196 L150 180 Z" fill="#0b0c10"/>
      <path d="M150 196 L360 172 C430 162 520 158 606 160 L606 166 C520 164 430 168 360 178 L150 202 Z" fill="#ff87bc"/>`,
    marcas: [
      { x: 450, y: 201, texto: 'ALPINE', tamanho: 20, cor: '#fff', peso: 900, espaco: 3, giro: -4 },
      { x: 335, y: 162, texto: 'eni', tamanho: 24, cor: '#fff', peso: 700, giro: -7 },
    ],
    asa: texto(110, 142, 10, '#ff87bc', 'ALPINE'),
  },

  'racing-bulls': {
    base: '#f2f4f8',
    capacete: '#1634cc',
    aro: { disco: '#c9cacf', linha: '#e8e8ea', borda: '#0c0c0e' },
    numero: NUMERO_ESCURO,
    tampa: '#121214',
    airbox: '#f2c500',
    flapDianteiro: '#1634cc',
    endplate: '#1634cc',
    asaTraseira: '#121214',
    pinturaCorpo:
      '<path d="M600 168 C700 184 820 204 980 222 L980 260 L600 260 Z" fill="#1634cc"/>',
    pinturaPod: '<path d="M262 216 C360 222 500 222 606 196 L606 262 L262 262 Z" fill="#1634cc"/>',
    marcas: [
      {
        x: 470,
        y: 202,
        giro: -4,
        texto: 'VISA',
        tamanho: 26,
        cor: '#1634cc',
        peso: 900,
        italico: true,
        espaco: 1,
      },
      { x: 276, y: 156, svg: touros(276, 156, 0.75), giro: -7 },
      { x: 520, y: 156, texto: 'cash app', tamanho: 12, cor: '#00b84d', giro: -6 },
      { x: 352, y: 161, texto: 'Red Bull', tamanho: 17, cor: '#d8102b', peso: 900, giro: -7 },
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
      '<path d="M100 200 L960 200 L960 260 L100 260 Z" fill="#121214"/><path d="M600 170 C700 186 820 204 976 230 L976 236 C820 210 700 192 600 176 Z" fill="#e6002b"/>',
    pinturaPod:
      '<path d="M150 200 C260 186 420 180 606 178 L606 230 L150 230 Z" fill="#121214"/><path d="M150 196 C260 182 420 176 606 174 L606 180 C420 182 260 188 150 202 Z" fill="#e6002b"/>',
    marcas: [
      {
        x: 455,
        y: 160,
        texto: 'TOYOTA GAZOO Racing',
        tamanho: 11,
        cor: '#121214',
        peso: 900,
        giro: -8,
      },
      { x: 450, y: 200, texto: 'HAAS', tamanho: 16, cor: '#fff', peso: 900, espaco: 3, giro: -4 },
      { x: 335, y: 162, texto: 'TGR', tamanho: 20, cor: '#e6002b', peso: 900, giro: -7 },
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
      '<path d="M100 120 L380 60 L420 240 L100 240 Z" fill="#121214"/><path d="M600 168 C700 184 820 204 976 230 L976 234 C820 208 700 190 600 174 Z" fill="#f50537"/>',
    pinturaPod:
      '<path d="M150 140 L360 140 L330 240 L150 240 Z" fill="#121214"/><path d="M360 140 L368 140 L338 240 L330 240 Z" fill="#f50537"/>',
    marcas: [
      { x: 470, y: 200, texto: 'Revolut', tamanho: 22, cor: '#121214', peso: 800, giro: -4 },
      { x: 334, y: 160, svg: argolas(318, 160, '#e6e6ea'), giro: -7 },
    ],
    asa: texto(110, 142, 10, '#fff', 'Revolut'),
  },

  cadillac: {
    base: '#0e0e10',
    capacete: '#1c1c20',
    aro: {
      raiosFinos: true,
      raios: '#34343a',
      anel: ['#e6e6ea'],
      larguraDoAnel: 11,
      recuoDoAnel: 24,
    },
    numero: NUMERO_CLARO,
    tampa: '#0e0e10',
    airbox: '#0e0e10',
    asaTraseira: '#0e0e10',
    endplate: '#c8c9cd',
    flapDianteiro: '#c8c9cd',
    pinturaCorpo: `
      <path d="M640 166 C690 167 730 170 758 174 L758 182 C730 180 690 182 640 185 Z" fill="#f2f2f2"/>
      <rect x="250" y="128" width="14" height="6" fill="#bfc0c4" opacity="0.55"/><rect x="304" y="128" width="10" height="6" fill="#bfc0c4" opacity="0.34"/><rect x="344" y="128" width="18" height="6" fill="#bfc0c4" opacity="0.19"/><rect x="351" y="128" width="14" height="6" fill="#bfc0c4" opacity="0.16"/><rect x="367" y="128" width="18" height="6" fill="#bfc0c4" opacity="0.10"/><rect x="390" y="128" width="10" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="417" y="128" width="14" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="274" y="137" width="14" height="6" fill="#bfc0c4" opacity="0.46"/><rect x="286" y="137" width="14" height="6" fill="#bfc0c4" opacity="0.41"/><rect x="316" y="137" width="10" height="6" fill="#bfc0c4" opacity="0.30"/><rect x="368" y="137" width="14" height="6" fill="#bfc0c4" opacity="0.10"/><rect x="377" y="137" width="14" height="6" fill="#bfc0c4" opacity="0.06"/><rect x="390" y="137" width="18" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="260" y="146" width="10" height="6" fill="#bfc0c4" opacity="0.51"/><rect x="279" y="146" width="14" height="6" fill="#bfc0c4" opacity="0.44"/><rect x="299" y="146" width="10" height="6" fill="#bfc0c4" opacity="0.36"/><rect x="341" y="146" width="10" height="6" fill="#bfc0c4" opacity="0.20"/><rect x="356" y="146" width="14" height="6" fill="#bfc0c4" opacity="0.14"/><rect x="382" y="146" width="14" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="253" y="155" width="18" height="6" fill="#bfc0c4" opacity="0.54"/><rect x="262" y="155" width="10" height="6" fill="#bfc0c4" opacity="0.50"/><rect x="292" y="155" width="18" height="6" fill="#bfc0c4" opacity="0.39"/><rect x="381" y="155" width="10" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="287" y="164" width="10" height="6" fill="#bfc0c4" opacity="0.41"/><rect x="317" y="164" width="18" height="6" fill="#bfc0c4" opacity="0.29"/><rect x="326" y="164" width="14" height="6" fill="#bfc0c4" opacity="0.26"/><rect x="341" y="164" width="14" height="6" fill="#bfc0c4" opacity="0.20"/><rect x="406" y="164" width="18" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="248" y="173" width="10" height="6" fill="#bfc0c4" opacity="0.56"/><rect x="277" y="173" width="18" height="6" fill="#bfc0c4" opacity="0.45"/><rect x="300" y="173" width="10" height="6" fill="#bfc0c4" opacity="0.36"/><rect x="368" y="173" width="10" height="6" fill="#bfc0c4" opacity="0.10"/><rect x="393" y="173" width="18" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="408" y="173" width="18" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="417" y="173" width="10" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="250" y="182" width="18" height="6" fill="#bfc0c4" opacity="0.55"/><rect x="262" y="182" width="10" height="6" fill="#bfc0c4" opacity="0.50"/><rect x="277" y="182" width="14" height="6" fill="#bfc0c4" opacity="0.45"/><rect x="286" y="182" width="14" height="6" fill="#bfc0c4" opacity="0.41"/><rect x="300" y="182" width="10" height="6" fill="#bfc0c4" opacity="0.36"/><rect x="343" y="182" width="10" height="6" fill="#bfc0c4" opacity="0.19"/><rect x="357" y="182" width="14" height="6" fill="#bfc0c4" opacity="0.14"/><rect x="380" y="182" width="14" height="6" fill="#bfc0c4" opacity="0.05"/><rect x="406" y="182" width="18" height="6" fill="#bfc0c4" opacity="0.05"/>
      <path d="M870 190 C930 206 970 220 1000 232 L1000 270 L870 270 Z" fill="#c8c9cd"/>`,
    marcas: [
      {
        x: 425,
        y: 202,
        texto: 'TWG',
        tamanho: 30,
        cor: '#f2f2f2',
        peso: 700,
        serifa: true,
        espaco: 1,
        giro: -3,
      },
      {
        x: 345,
        y: 160,
        texto: 'CADILLAC',
        tamanho: 14,
        cor: '#fff',
        peso: 800,
        espaco: 3,
        giro: -7,
      },
      { x: 466, y: 158, texto: 'CORE SCIENTIFIC', tamanho: 9, cor: '#fff', peso: 800, giro: -5 },
      {
        x: 690,
        y: 179,
        texto: 'Cadillac',
        tamanho: 11,
        cor: '#0e0e10',
        italico: true,
        serifa: true,
        giro: 3,
      },
      { x: 718, y: 197, texto: 'Claro', tamanho: 9, cor: '#fff', peso: 700 },
    ],
    asa: `<path d="M62 102 Q62 100 66 100 L146 100 L149 130 L148 140 L64 140 Z" fill="#d4d5d9"/>${texto(108, 126, 15, '#111', 'IFS')}`,
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
    pinturaCorpo: `<path d="M600 162 C700 178 820 200 976 230 L976 236 C820 208 700 186 600 170 Z" fill="${corSecundaria}"/>`,
  };
}

export function pinturaDaEquipe(nome: string, cores: CoresDaEquipe) {
  return PINTURAS[chaveDaEquipe(nome)] ?? pinturaGenerica(cores);
}
