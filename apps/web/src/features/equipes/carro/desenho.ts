import type { Aro, Marca, Pintura } from './tipos';

/*
 * Um F1 de 2026 visto de lado, com o bico para a direita, desenhado em SVG.
 * A carroceria é uma só para todas as equipes; a pintura muda por equipe.
 * O viewBox é 0 0 1000 300 e o chão fica em y = 280.
 */

export const VIEWBOX = '0 0 1000 300';

const FONTE_MARCAS = "'Manrope Variable', 'Manrope', system-ui, sans-serif";
const FONTE_NUMERO = "'Orbitron Variable', 'Orbitron', system-ui, sans-serif";

const RODA_TRAS = { x: 214, y: 212, r: 70 };
const RODA_FRENTE = { x: 792, y: 215, r: 67 };

/** Carroceria: traseira, airbox, cockpit e bico. */
const CORPO = `M120 240 L124 176 C170 170 220 162 262 152 C310 140 350 124 372 110
C382 103 388 100 392 100 Q404 91 418 91 Q433 92 437 104 L439 134
C470 136 510 139 540 141 C600 150 660 164 720 178 C800 194 880 203 950 209
Q968 213 958 224 C880 230 790 230 720 226 L620 222 L600 232 L150 244 Z`;

/** Sidepod, o lado mais perto de quem olha. */
const SIDEPOD = `M604 150 C540 141 450 141 380 148 C300 158 230 174 168 196
C210 206 250 210 300 210 C390 208 480 200 548 194 Q592 190 604 180 Z`;

/** Tampa do motor: sai reta do airbox e desce em cima da roda traseira. */
const TAMPA = 'M194 172 L194 124 Q195 115 205 114 L396 98 L396 132 L194 172 Z';

/** Quanto a asa traseira desce em relação ao desenho original dela. */
const DESCIDA_DA_ASA = 14;

const numeroFixo = (valor: number) => Number(valor.toFixed(2));

function ponto(x: number, y: number, raio: number, angulo: number) {
  return `${numeroFixo(x + raio * Math.cos(angulo))} ${numeroFixo(y + raio * Math.sin(angulo))}`;
}

/** Anel do aro: as cores dão a volta na roda (uma cor só = anel liso). */
function anel(x: number, y: number, raio: number, largura: number, cores: string[]) {
  if (cores.length === 1) {
    return `<circle cx="${x}" cy="${y}" r="${raio}" fill="none" stroke="${cores[0]}" stroke-width="${largura}"/>`;
  }

  return cores
    .map((cor, i) => {
      const inicio = (i / cores.length) * 2 * Math.PI - Math.PI / 2;
      const fim = ((i + 1.04) / cores.length) * 2 * Math.PI - Math.PI / 2;

      return `<path d="M${ponto(x, y, raio, inicio)} A${raio} ${raio} 0 0 1 ${ponto(x, y, raio, fim)}" fill="none" stroke="${cor}" stroke-width="${largura}"/>`;
    })
    .join('');
}

function raios(x: number, y: number, raioDeFora: number, cor: string) {
  let caminho = '';

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * Math.PI + 0.2;
    const b = a + 0.16;
    caminho += `M${ponto(x, y, 7, a)} L${ponto(x, y, raioDeFora, a - 0.05)} L${ponto(x, y, raioDeFora, b + 0.05)} L${ponto(x, y, 7, b)}Z `;
  }

  return `<path d="${caminho}" fill="${cor}"/><circle cx="${x}" cy="${y}" r="${raioDeFora}" fill="none" stroke="${cor}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="9" fill="${cor}"/>`;
}

function roda({ x, y, r }: { x: number; y: number; r: number }, id: string, u: string, aro: Aro) {
  const raioDoTexto = r - 9;
  const texto = (conteudo: string, posicao: string) =>
    `<text font-family="${FONTE_MARCAS}" font-weight="800" font-size="9.5" fill="#f2f2f2" letter-spacing="1.2"><textPath href="#${id}" startOffset="${posicao}" text-anchor="middle">${conteudo}</textPath></text>`;

  return `<g>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#pneu${u})"/>
    <circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="none" stroke="#2a2a2d" stroke-width="1.2"/>
    <path id="${id}" d="M${x - raioDoTexto} ${y} A${raioDoTexto} ${raioDoTexto} 0 1 1 ${x + raioDoTexto} ${y}" fill="none"/>
    ${texto('PIRELLI', '27%')}${texto('P ZERO', '77%')}
    <circle cx="${x}" cy="${y}" r="${r - 21}" fill="${aro.fundo ?? '#0c0c0e'}"/>
    ${raios(x, y, r - 22, aro.raios ?? '#26262b')}
    ${aro.anel ? anel(x, y, r - 27, aro.larguraDoAnel ?? 3, aro.anel) : ''}
    <circle cx="${x}" cy="${y}" r="${r - 21}" fill="none" stroke="${aro.borda ?? '#1c1c20'}" stroke-width="2"/>
    <circle cx="${x}" cy="${y}" r="${r - 34}" fill="${aro.centro ?? '#0c0c0e'}"/>
    <circle cx="${x}" cy="${y}" r="5" fill="#3a3a3e"/>
    <path d="M${x - r + 26} ${y - 8} A${r - 24} ${r - 24} 0 0 1 ${x - 8} ${y - r + 26}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - r + 10} ${y - 18} A${r - 8} ${r - 8} 0 0 1 ${x - 6} ${y - r + 9}" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

function escapar(texto: string) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function marca(m: Marca) {
  const giro = m.giro ? ` transform="rotate(${m.giro} ${m.x} ${m.y})"` : '';

  if ('svg' in m) {
    return `<g${giro}>${m.svg}</g>`;
  }

  return `<text x="${m.x}" y="${m.y}" font-family="${m.serifa ? 'Georgia, serif' : FONTE_MARCAS}" font-weight="${m.peso ?? 800}" font-size="${m.tamanho}" fill="${m.cor}" text-anchor="middle" letter-spacing="${m.espaco ?? 0}"${m.italico ? ' font-style="italic"' : ''}${giro}>${escapar(m.texto)}</text>`;
}

/** O número do piloto vai no bico e na tampa do motor, como nos carros de verdade. */
function numeros(numero: number | undefined, pintura: Pintura) {
  if (numero === undefined) {
    return '';
  }

  const { cor, contorno } = pintura.numero;
  const texto = (x: number, y: number, tamanho: number, giro: number) =>
    `<text x="${x}" y="${y}" font-family="${FONTE_NUMERO}" font-weight="900" font-size="${tamanho}" fill="${cor}" stroke="${contorno}" stroke-width="3" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" transform="rotate(${giro} ${x} ${y})">${numero}</text>`;

  return texto(306, 140, 24, -5) + texto(892, 222, 15, 5);
}

/**
 * Monta o SVG do carro. `u` deixa os ids de gradientes e recortes únicos,
 * já que a página mostra vários carros ao mesmo tempo.
 */
export function desenharCarro(pintura: Pintura, numero: number | undefined, u: string) {
  const p = pintura;

  return `<defs>
    <linearGradient id="pneu${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b2b2e"/><stop offset=".5" stop-color="#151517"/><stop offset="1" stop-color="#0a0a0b"/>
    </linearGradient>
    <linearGradient id="luz${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".22" stop-color="#fff" stop-opacity=".06"/>
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="lado${u}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".25" stop-color="#000" stop-opacity="0"/>
      <stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/>
    </linearGradient>
    <linearGradient id="chao${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050506"/><stop offset=".35" stop-color="#18181c"/><stop offset="1" stop-color="#0a0a0c"/>
    </linearGradient>
    <radialGradient id="volume${u}" cx=".42" cy=".18" r=".75">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".25"/>
    </radialGradient>
    <radialGradient id="sombra${u}" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="tudo${u}"><path d="${CORPO}"/><path d="${SIDEPOD}"/><path d="${TAMPA}"/></clipPath>
    <clipPath id="corpo${u}"><path d="${CORPO}"/></clipPath>
    <clipPath id="tampa${u}"><path d="${TAMPA}"/></clipPath>
    <clipPath id="pod${u}"><path d="${SIDEPOD}"/></clipPath>
  </defs>

  <ellipse cx="520" cy="281" rx="490" ry="12" fill="url(#sombra${u})"/>
  <ellipse cx="214" cy="281" rx="70" ry="5" fill="#000" opacity=".55"/>
  <ellipse cx="792" cy="281" rx="66" ry="5" fill="#000" opacity=".55"/>

  <g transform="translate(0 ${DESCIDA_DA_ASA})">
    <path d="M94 100 Q94 92 106 91 L148 88 L150 166 L98 170 Z" fill="#0b0b0d"/>
    <path d="M148 196 L126 124" stroke="#141416" stroke-width="7"/>
    <path d="M82 104 Q82 96 94 95 L136 92 L140 168 L86 172 Z" fill="${p.asaTraseira ?? p.base}"/>
    <path d="M82 104 Q82 96 94 95 L136 92 L140 168 L86 172 Z" fill="url(#lado${u})"/>
    <path d="M84 104 Q84 98 94 97 L134 94" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>
    ${p.asa ?? ''}
    <path d="M62 98 L152 89 L154 104 L64 115 Z" fill="${p.flap ?? '#111'}"/>
    <path d="M62 98 L152 89 L152 93 L62 102 Z" fill="#fff" opacity=".22"/>
    <path d="M64 119 L152 108 L152 118 L66 129 Z" fill="${p.flap2 ?? '#1b1b1e'}"/>
  </g>
  <path d="M98 192 L142 188 L142 206 L120 218 L104 214 Z" fill="#141416"/>
  <path d="M92 214 L160 206 L160 216 L94 224 Z" fill="#141416"/>
  <path d="M96 232 L170 230 L176 252 L104 250 Z" fill="#0e0e10"/>

  <path d="M214 212 L330 200 M214 212 L330 232 M214 212 L300 186" stroke="#1a1a1d" stroke-width="4" stroke-linecap="round"/>

  <circle cx="458" cy="131" r="13.5" fill="${p.capacete}"/>
  <path d="M461 122 Q473 124 471.5 134 L461 134 Z" fill="#0d0d10"/>
  <path d="M448 123 Q458 115 468 120" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>
  <g transform="translate(-18 8)">${p.capaceteDetalhe ?? ''}</g>

  <path d="M110 242 L600 232 L760 230 L760 240 L600 246 L112 254 Z" fill="#0f0f11"/>
  <path d="M150 248 L600 240 L760 236" stroke="#4a4a50" stroke-width="1.2" fill="none"/>
  <path d="M620 224 L860 232 L860 238 L620 232 Z" fill="#111114"/>

  <path d="${CORPO}" fill="${p.base}"/>
  <g clip-path="url(#corpo${u})">${p.pinturaCorpo ?? ''}</g>
  <path d="${CORPO}" fill="url(#luz${u})"/>
  <path d="${CORPO}" fill="url(#volume${u})" opacity=".7"/>
  <path d="${TAMPA}" fill="${p.tampa ?? p.base}"/>
  <g clip-path="url(#tampa${u})">${p.pinturaTampa ?? ''}</g>
  <path d="${TAMPA}" fill="url(#luz${u})"/>
  <path d="M196 124 Q197 117 206 116 L396 100" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none"/>
  <path d="M194 172 L194 124" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
  <path d="M440 136 C480 132 520 138 560 148 L560 156 C520 146 480 140 440 144 Z" fill="#000" opacity=".22"/>

  <path d="M604 180 Q592 190 548 194 C480 200 390 208 300 210 C250 210 210 206 168 196 L150 244 L600 232 L620 222 Z" fill="url(#chao${u})"/>
  <path d="M300 224 C400 220 500 215 604 212" stroke="#3a3a42" stroke-width="1.4" fill="none"/>
  <path d="M330 234 C430 230 520 226 612 222" stroke="#2c2c33" stroke-width="1.2" fill="none"/>
  <path d="M560 198 C590 196 610 192 618 186 C624 198 620 214 608 228" stroke="#46464e" stroke-width="1.6" fill="none"/>
  <path d="M300 210 C390 208 480 200 548 194 Q592 190 604 180" stroke="#000" stroke-opacity=".6" stroke-width="3" fill="none"/>
  <path d="M526 246 C536 232 546 220 560 214 C580 206 600 204 616 204 L676 206 Q680 207 680 212 L680 244 Z" fill="#141417"/>
  <path d="M532 240 C544 226 556 218 570 213 C588 208 604 207 616 207 L676 209" stroke="#fff" stroke-opacity=".28" stroke-width="1.3" fill="none"/>
  <path d="M600 214 L674 216 M596 222 L674 224 M592 230 L674 232" stroke="#2f2f35" stroke-width="1.6"/>
  <path d="M640 207 L640 244 M660 208 L660 244" stroke="#26262b" stroke-width="1.2"/>

  <path d="${SIDEPOD}" fill="${p.sidepod ?? p.base}"/>
  <g clip-path="url(#pod${u})">${p.pinturaPod ?? ''}</g>
  <path d="${SIDEPOD}" fill="url(#luz${u})"/>
  <path d="${SIDEPOD}" fill="url(#volume${u})"/>
  <path d="M590 150 L604 150 L605 180 Q600 190 588 192 Z" fill="#070708"/>
  <path d="M384 150 C460 143 540 143 600 150" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" fill="none"/>

  <path d="M424 96 Q435 99 436 110 L436 122 Q429 122 427 112 Q425 103 418 99 Z" fill="#060607"/>
  <path d="M424 96 Q435 99 436 110" stroke="#fff" stroke-opacity=".3" stroke-width="1" fill="none"/>
  <path d="M404 91 L406 84 L424 84 L426 91 Z" fill="#111214"/>
  <path d="M406 85 L424 85" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
  <path d="M544 143 C600 152 660 166 720 180 C800 196 880 205 950 211" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/>

  <g clip-path="url(#tudo${u})">${(p.marcas ?? []).map(marca).join('')}${numeros(numero, p)}</g>

  <path d="M436 118 C452 104 508 102 548 140" stroke="#141416" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M442 113 C458 106 500 106 534 128" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
  <path d="M570 146 L578 134" stroke="#141416" stroke-width="3"/>
  <path d="M572 128 L598 127 L598 137 L574 138 Z" fill="${p.retrovisor ?? p.base}"/>
  <path d="M572 128 L598 127 L598 137 L574 138 Z" fill="url(#luz${u})"/>

  <path d="M792 215 L680 196 M792 215 L690 220 M792 215 L700 180" stroke="#1a1a1d" stroke-width="4" stroke-linecap="round"/>

  ${roda(RODA_TRAS, `pt${u}`, u, p.aro)}
  ${roda(RODA_FRENTE, `pf${u}`, u, p.aro)}

  <path d="M846 266 L986 260 L988 272 L848 276 Z" fill="#141416"/>
  <path d="M872 254 C920 248 955 245 982 244 L982 253 C955 255 920 258 874 262 Z" fill="${p.flapDianteiro ?? p.base}"/>
  <path d="M872 254 C920 248 955 245 982 244 L982 253 C955 255 920 258 874 262 Z" fill="url(#luz${u})"/>
  <path d="M958 238 L984 235 Q993 242 992 272 L960 274 Z" fill="${p.endplate ?? p.base}"/>
  <path d="M958 238 L984 235 Q993 242 992 272 L960 274 Z" fill="url(#lado${u})"/>
  ${p.frente ?? ''}`;
}
