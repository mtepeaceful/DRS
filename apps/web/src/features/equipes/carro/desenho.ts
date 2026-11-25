import type { Aro, Marca, Pintura } from './tipos';

/*
 * Um F1 de 2026 visto de lado, com o bico para a direita, desenhado em SVG.
 * A carroceria é uma só para todas as equipes; a pintura muda por equipe.
 * O viewBox é 0 0 1000 300 e o chão fica em y = 280.
 */

export const VIEWBOX = '0 0 1000 300';

const FONTE_MARCAS = "'Manrope Variable', 'Manrope', system-ui, sans-serif";
const FONTE_NUMERO = "'Orbitron Variable', 'Orbitron', system-ui, sans-serif";

/*
 * Medidas tiradas de um F1 de 2026 de lado: entre-eixos de 3,4 m em 5,4 m de
 * carro e rodas de 72 cm. Os contornos abaixo seguem a foto ponto a ponto.
 */
const RODA_TRAS = { x: 182, y: 209, r: 70 };
const RODA_FRENTE = { x: 819, y: 209, r: 70 };

/** Carroceria: tampa do motor, cockpit, chassi e bico. */
const CORPO = `M206 248 L210 168 C214 158 218 154 222 150 C230 136 238 124 252 118
C300 106 380 96 452 90 L494 92 L500 128 C540 130 600 140 640 152
C690 156 730 158 760 164 C810 176 860 192 900 204 C940 216 975 226 988 234
Q995 243 988 250 C940 252 890 250 860 244 C820 236 780 220 740 206
L650 198 L600 230 L206 248 Z`;

/** Tampa do motor: desce do airbox até a roda traseira. */
const TAMPA = `M214 160 C222 146 236 124 252 118 C300 106 380 96 452 90 L452 124
C400 126 330 128 294 134 C270 140 250 150 238 160 Z`;

/** Sidepod: ombro alto, entrada logo abaixo do halo e o rebaixo na frente. */
const SIDEPOD = `M600 150 C560 136 470 128 375 128 C330 128 300 132 294 134
C270 140 250 150 238 160 C226 190 226 222 240 244 C320 250 440 250 520 246
C556 238 584 216 604 192 Z`;

/** Airbox em cima da cabeça do piloto. */
const AIRBOX = 'M450 92 Q452 86 462 86 L484 86 Q493 87 494 96 L498 132 L452 132 Z';

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

/** Calota lisa que cobre os raios, como a da Racing Bulls. */
function disco(x: number, y: number, raio: number, cor: string, u: string) {
  return `<circle cx="${x}" cy="${y}" r="${raio}" fill="${cor}"/><circle cx="${x}" cy="${y}" r="${raio}" fill="url(#calota${u})"/><circle cx="${x}" cy="${y}" r="9" fill="#2a2a2e"/><circle cx="${x}" cy="${y}" r="4" fill="#8a8a90"/>`;
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
    ${aro.linha ? `<circle cx="${x}" cy="${y}" r="${r - 17}" fill="none" stroke="${aro.linha}" stroke-width="1.6"/>` : ''}
    <circle cx="${x}" cy="${y}" r="${r - 21}" fill="${aro.fundo ?? '#0c0c0e'}"/>
    ${aro.disco ? disco(x, y, r - 25, aro.disco, u) : raios(x, y, r - 22, aro.raios ?? '#26262b')}
    ${aro.anel ? anel(x, y, r - 27, aro.larguraDoAnel ?? 3, aro.anel) : ''}
    <circle cx="${x}" cy="${y}" r="${r - 21}" fill="none" stroke="${aro.borda ?? '#1c1c20'}" stroke-width="2"/>
    ${aro.disco ? '' : `<circle cx="${x}" cy="${y}" r="${r - 34}" fill="${aro.centro ?? '#0c0c0e'}"/>`}
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

  return texto(272, 140, 22, -12) + texto(928, 234, 13, 16);
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
    <radialGradient id="calota${u}" cx=".4" cy=".35" r=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
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
  <ellipse cx="182" cy="281" rx="70" ry="5" fill="#000" opacity=".55"/>
  <ellipse cx="819" cy="281" rx="70" ry="5" fill="#000" opacity=".55"/>

  <path d="M96 196 L150 192 L156 244 L104 240 Z" fill="#0e0e10"/>
  <path d="M100 210 L150 206 M102 224 L152 220" stroke="#2a2a2f" stroke-width="1.5"/>
  <path d="M140 100 C170 100 196 106 210 114 L208 126 C190 120 168 118 146 122 Z" fill="${p.flap ?? '#111'}"/>
  <path d="M142 101 C170 101 194 106 208 113" stroke="#fff" stroke-opacity=".25" stroke-width="1.2" fill="none"/>
  <path d="M60 102 Q60 98 66 98 L146 98 L150 132 L126 162 L102 216 L90 216 Z" fill="${p.asaTraseira ?? p.base}"/>
  <path d="M60 102 Q60 98 66 98 L146 98 L150 132 L126 162 L102 216 L90 216 Z" fill="url(#lado${u})"/>
  <path d="M62 102 Q62 100 66 100 L144 100" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>
  ${p.asa ?? ''}

  <path d="M182 209 L300 198 M182 209 L300 232 M182 209 L280 182" stroke="#1a1a1d" stroke-width="4" stroke-linecap="round"/>

  <path d="M888 202 Q900 194 914 198 L922 258 L886 260 Z" fill="${p.endplate ?? p.base}"/>
  <path d="M888 202 Q900 194 914 198 L922 258 L886 260 Z" fill="url(#lado${u})"/>

  <circle cx="522" cy="124" r="12.5" fill="${p.capacete}"/>
  <path d="M525 115 Q536 117 534.5 127 L525 127 Z" fill="#0d0d10"/>
  <path d="M513 116 Q522 108 532 113" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>
  <g transform="translate(46 1)">${p.capaceteDetalhe ?? ''}</g>

  <path d="M204 246 L760 238 L762 250 L206 258 Z" fill="#0f0f11"/>
  <path d="M220 252 L760 244" stroke="#4a4a50" stroke-width="1.2" fill="none"/>
  <path d="M604 192 C620 200 650 200 700 200 L756 206 L760 246 L520 250 C560 240 586 220 604 192 Z" fill="url(#chao${u})"/>
  <path d="M612 214 L756 216 M606 226 L758 228 M598 238 L758 238" stroke="#2f2f35" stroke-width="1.6"/>
  <path d="M700 200 L700 246 M730 203 L730 246" stroke="#26262b" stroke-width="1.2"/>
  <path d="M620 202 C660 204 700 204 756 208" stroke="#fff" stroke-opacity=".22" stroke-width="1.3" fill="none"/>

  <path d="${CORPO}" fill="${p.base}"/>
  <g clip-path="url(#corpo${u})">${p.pinturaCorpo ?? ''}</g>
  <path d="${CORPO}" fill="url(#luz${u})"/>
  <path d="${CORPO}" fill="url(#volume${u})" opacity=".7"/>
  <path d="${TAMPA}" fill="${p.tampa ?? p.base}"/>
  <g clip-path="url(#tampa${u})">${p.pinturaTampa ?? ''}</g>
  <path d="${TAMPA}" fill="url(#luz${u})"/>
  <path d="M224 148 C232 134 240 124 254 120 C300 108 380 98 450 92" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none"/>
  <path d="M500 136 C540 134 600 144 640 158 L640 164 C600 152 540 142 500 144 Z" fill="#000" opacity=".22"/>

  <path d="${SIDEPOD}" fill="${p.sidepod ?? p.base}"/>
  <g clip-path="url(#pod${u})">${p.pinturaPod ?? ''}</g>
  <path d="${SIDEPOD}" fill="url(#luz${u})"/>
  <path d="${SIDEPOD}" fill="url(#volume${u})"/>
  <path d="M520 246 C556 238 584 216 604 192" stroke="#000" stroke-opacity=".5" stroke-width="3" fill="none"/>
  <path d="M592 148 L602 150 L604 190 Q598 196 590 192 Z" fill="#070708"/>
  <path d="M300 135 C380 129 500 131 596 150" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" fill="none"/>

  <path d="${AIRBOX}" fill="${p.airbox ?? p.tampa ?? p.base}"/>
  <path d="${AIRBOX}" fill="url(#luz${u})"/>
  <path d="M484 90 Q492 92 493 102 L494 114 Q487 114 486 104 Q485 96 480 92 Z" fill="#060607"/>
  <path d="M456 86 L458 78 L488 78 L490 86 Z" fill="#111214"/>
  <path d="M458 79 L488 79" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
  <path d="M640 152 C690 156 730 158 760 164 C810 176 860 192 900 204 C940 216 975 226 986 233" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/>

  <g clip-path="url(#tudo${u})">${(p.marcas ?? []).map(marca).join('')}${numeros(numero, p)}</g>

  <path d="M496 120 C520 114 570 112 600 120 C626 126 644 140 654 154" stroke="#141416" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M502 116 C526 111 568 110 596 116" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
  <path d="M606 150 L612 140" stroke="#141416" stroke-width="3"/>
  <path d="M598 133 L624 132 L624 142 L600 143 Z" fill="${p.retrovisor ?? p.base}"/>
  <path d="M598 133 L624 132 L624 142 L600 143 Z" fill="url(#luz${u})"/>

  <path d="M819 209 L700 196 M819 209 L706 222 M819 209 L714 182" stroke="#1a1a1d" stroke-width="4" stroke-linecap="round"/>

  ${roda(RODA_TRAS, `pt${u}`, u, p.aro)}
  ${roda(RODA_FRENTE, `pf${u}`, u, p.aro)}

  <path d="M872 254 L990 250 L992 262 L874 266 Z" fill="#141416"/>
  <path d="M900 246 C940 244 968 244 990 243 L990 250 C968 251 940 252 902 253 Z" fill="${p.flapDianteiro ?? p.base}"/>
  <path d="M900 246 C940 244 968 244 990 243 L990 250 C968 251 940 252 902 253 Z" fill="url(#luz${u})"/>
  ${p.frente ?? ''}`;
}
