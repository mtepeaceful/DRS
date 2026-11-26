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
const CORPO = `M206 248 L210 176 C220 172 230 162 238 156 L248 118 Q250 113 256 112
C300 106 380 96 452 90 L494 92 L500 128 C540 130 600 140 640 152
C690 156 730 158 760 164 C810 176 860 192 900 204 C940 216 975 226 988 234
Q995 243 988 250 C940 252 890 250 860 244 C820 236 780 220 740 206
L650 198 L600 230 L206 248 Z`;

/** Tampa do motor: sai do airbox e termina num corte reto em cima da roda traseira. */
const TAMPA = `M238 156 L248 118 Q250 113 256 112 C300 106 380 96 452 90 L452 124
C400 128 330 140 300 150 C270 156 252 158 238 156 Z`;

/**
 * Sidepod, decalcado da foto da Cadillac: a borda de cima sobe em diagonal até
 * a entrada, a frente é arredondada e a lateral termina antes do rebaixo.
 */
const SIDEPOD = `M600 164 C606 168 608 178 602 186 C590 190 580 190 571 190
C540 194 520 198 500 201 C460 207 430 211 400 214 C360 218 330 222 300 224
C280 224 266 222 260 216 C258 210 260 206 266 204 C280 200 290 198 300 197
C340 192 370 189 400 186 C440 182 470 178 500 175 C530 171 550 168 571 166
C584 164 592 163 600 164 Z`;

/** Entrada de ar do sidepod: a boca escura na frente dele, abaixo do halo. */
const ENTRADA =
  'M598 162 C614 166 630 172 642 178 L642 200 C628 196 614 192 602 188 C608 180 606 168 598 162 Z';

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

/** Raios finos em pares, como os das rodas da Williams e da Cadillac. */
function raiosFinos(x: number, y: number, raioDeFora: number, cor: string) {
  let caminho = '';

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * Math.PI + 0.3;
    caminho += `M${ponto(x, y, 9, a - 0.12)} L${ponto(x, y, raioDeFora, a - 0.06)} M${ponto(x, y, 9, a + 0.12)} L${ponto(x, y, raioDeFora, a + 0.06)} `;
  }

  return `<path d="${caminho}" stroke="${cor}" stroke-width="2.2" stroke-linecap="round" fill="none"/><circle cx="${x}" cy="${y}" r="${raioDeFora}" fill="none" stroke="${cor}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="10" fill="#8d8e94"/><circle cx="${x}" cy="${y}" r="5" fill="#2a2a2e"/>`;
}

/** Blocos de cor em volta do aro, alternando as cores dadas. */
function blocos(
  x: number,
  y: number,
  raio: number,
  largura: number,
  quantidade: number,
  cores: string[],
) {
  const passo = (2 * Math.PI) / quantidade;

  return Array.from({ length: quantidade }, (_, i) => {
    const inicio = i * passo;
    const fim = inicio + passo * 0.86;

    return `<path d="M${ponto(x, y, raio, inicio)} A${raio} ${raio} 0 0 1 ${ponto(x, y, raio, fim)}" fill="none" stroke="${cores[i % cores.length]}" stroke-width="${largura}"/>`;
  }).join('');
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
    ${aro.anel ? anel(x, y, r - (aro.recuoDoAnel ?? 27), aro.larguraDoAnel ?? 3, aro.anel) : ''}
    ${aro.blocos ? blocos(x, y, r - 25, aro.blocos.largura, aro.blocos.quantidade, aro.blocos.cores) : ''}
    ${aro.disco ? disco(x, y, r - 25, aro.disco, u) : aro.raiosFinos ? raiosFinos(x, y, r - (aro.anel || aro.blocos ? 30 : 22), aro.raios ?? '#3a3a40') : raios(x, y, r - 22, aro.raios ?? '#26262b')}
    <circle cx="${x}" cy="${y}" r="${r - 21}" fill="none" stroke="${aro.borda ?? '#1c1c20'}" stroke-width="2"/>
    ${aro.disco || aro.raiosFinos ? '' : `<circle cx="${x}" cy="${y}" r="${r - 34}" fill="${aro.centro ?? '#0c0c0e'}"/>`}
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
 * Relevos suaves, como os reflexos de um carro de verdade: um brilho na tampa do
 * motor e no ombro do sidepod, a sombra do rebaixo embaixo do sidepod, o painel
 * do defletor e o suporte da asa traseira. Ficam longe das faixas dos
 * patrocinadores e sempre por baixo deles.
 */
function relevos(u: string) {
  const suave = (d: string, cor: string, opacidade: number) =>
    `<path d="${d}" fill="${cor}" opacity="${opacidade}" filter="url(#suave${u})"/>`;

  return `
  <path d="M186 112 Q206 106 216 120 L220 150 L196 154 Z" fill="#0b0b0d"/>
  <path d="M188 113 Q205 108 214 121" stroke="#fff" stroke-opacity=".3" stroke-width="1" fill="none"/>
  <g clip-path="url(#tampa${u})">
    ${suave('M246 120 C300 112 380 102 452 95 L452 101 C380 108 300 118 248 126 Z', '#fff', 0.3)}
  </g>
  ${suave('M470 228 C520 226 560 222 590 216 L590 222 C560 228 520 232 470 234 Z', '#fff', 0.22)}
  <path d="M580 222 C596 210 608 200 622 197 L682 195 L694 197 L694 253 L580 257 Z" fill="#242429"/>
  <path d="M586 230 L690 206 M584 240 L692 216 M584 250 L692 228" stroke="#2e2e34" stroke-width="1.2"/>
  <path d="M580 222 C596 210 608 200 622 197 L682 195 L694 197" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>
  <path d="M694 197 L694 253" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
  <path d="M718 272 L716 244 L728 220 L752 206 L774 206" stroke="#26262b" stroke-width="5" fill="none" stroke-linejoin="round"/>
  <path d="M718 268 L717 244 L729 221 L752 208 L772 208" stroke="#fff" stroke-opacity=".16" stroke-width="1.2" fill="none" stroke-linejoin="round"/>`;
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
    <linearGradient id="podLado${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".3" stop-color="#fff" stop-opacity=".04"/>
      <stop offset=".75" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".45"/>
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
    <filter id="suave${u}" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="3.5"/></filter>
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

  <circle cx="524" cy="130" r="12.5" fill="${p.capacete}"/>
  <path d="M527 121 Q538 123 536.5 133 L527 133 Z" fill="#0d0d10"/>
  <path d="M515 122 Q524 114 534 119" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>
  <g transform="translate(48 7)">${p.capaceteDetalhe ?? ''}</g>

  <path d="M204 240 L760 234 L762 250 L206 258 Z" fill="#1b1b1f"/>
  <path d="M206 256 L760 248" stroke="#5a5a62" stroke-width="1.2" fill="none"/>
  <path d="M206 247 L760 241" stroke="#2c2c32" stroke-width="1" fill="none"/>
  <path d="M604 192 C620 200 650 200 700 200 L756 206 L760 246 L520 250 C560 240 586 220 604 192 Z" fill="url(#chao${u})"/>
  <path d="M612 214 L756 216 M606 226 L758 228 M598 238 L758 238" stroke="#2f2f35" stroke-width="1.6"/>
  <path d="M700 200 L700 246 M730 203 L730 246" stroke="#26262b" stroke-width="1.2"/>
  <path d="M620 202 C660 204 700 204 756 208" stroke="#fff" stroke-opacity=".22" stroke-width="1.3" fill="none"/>

  <path d="M732 166 Q744 146 768 144 Q792 144 804 160 L804 176 L732 176 Z" fill="#0c0c0e"/>
  <path d="M738 160 Q750 148 768 147 Q788 147 798 158" stroke="#fff" stroke-opacity=".14" stroke-width="2" fill="none"/>
  <path d="${CORPO}" fill="${p.base}"/>
  <g clip-path="url(#corpo${u})">${p.pinturaCorpo ?? ''}</g>
  <path d="${CORPO}" fill="url(#luz${u})"/>
  <path d="${CORPO}" fill="url(#volume${u})" opacity=".7"/>
  <path d="${TAMPA}" fill="${p.tampa ?? p.base}"/>
  <g clip-path="url(#tampa${u})">${p.pinturaTampa ?? ''}</g>
  <path d="M250 115 Q252 113 258 113 C300 107 380 98 450 92" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none"/>
  <path d="M238 156 L248 118" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>
  <path d="M500 136 C540 134 600 144 640 158 L640 164 C600 152 540 142 500 144 Z" fill="#000" opacity=".22"/>

  <g clip-path="url(#corpo${u})">
    <path d="M250 150 C360 132 470 116 600 124 L600 132 C470 126 360 142 252 160 Z" fill="#fff" opacity=".14" filter="url(#suave${u})"/>
    <path d="M440 132 C480 126 520 126 560 132 L560 142 C520 136 480 136 440 142 Z" fill="#fff" opacity=".16" filter="url(#suave${u})"/>
    <path d="M540 150 C570 146 610 150 640 160 L640 166 C610 158 570 154 542 156 Z" fill="#fff" opacity=".22" filter="url(#suave${u})"/>
    <path d="M262 192 C330 186 440 172 600 156 L600 166 C440 180 330 194 262 200 Z" fill="#000" opacity=".3" filter="url(#suave${u})"/>
    <path d="M258 220 C300 226 400 216 500 203 C540 196 580 190 604 188 L660 200 L660 244 L250 248 Z" fill="#050506" opacity=".85"/>
    <path d="M330 228 C420 220 500 210 560 200 L600 196 L600 204 C560 208 470 220 330 234 Z" fill="#fff" opacity=".12" filter="url(#suave${u})"/>
    <path d="M222 176 C236 176 250 178 262 184 L262 222 L222 228 Z" fill="#000" opacity=".45" filter="url(#suave${u})"/>
  </g>
  <path d="${SIDEPOD}" fill="${p.sidepod ?? p.base}"/>
  <g clip-path="url(#pod${u})">${p.pinturaPod ?? ''}</g>
  <path d="${SIDEPOD}" fill="url(#podLado${u})"/>
  <path d="${ENTRADA}" fill="#050506"/>
  <path d="M598 162 C614 166 630 172 642 178" stroke="#fff" stroke-opacity=".3" stroke-width="1" fill="none"/>
  <path d="M266 204 C280 200 290 198 300 197 C340 192 370 189 400 186 C440 182 470 178 500 175 C530 171 550 168 571 166 C584 164 592 163 600 164" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" fill="none"/>
  <path d="M262 218 C280 224 300 224 330 222 C360 218 400 214 460 207 C500 201 540 194 571 190 C584 189 594 189 602 186" stroke="#000" stroke-opacity=".55" stroke-width="1.6" fill="none"/>

  <path d="${AIRBOX}" fill="${p.airbox ?? p.tampa ?? p.base}"/>
  <path d="${AIRBOX}" fill="url(#luz${u})"/>
  <path d="M484 90 Q492 92 493 102 L494 114 Q487 114 486 104 Q485 96 480 92 Z" fill="#060607"/>
  <path d="M456 86 L458 78 L488 78 L490 86 Z" fill="#111214"/>
  <path d="M458 79 L488 79" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
  <path d="M640 152 C690 156 730 158 760 164 C810 176 860 192 900 204 C940 216 975 226 986 233" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/>

  ${relevos(u)}

  <g clip-path="url(#tudo${u})">${(p.marcas ?? []).map(marca).join('')}${numeros(numero, p)}</g>

  <path d="M492 142 C506 132 536 127 580 126 C614 125 634 127 642 134 C648 140 650 148 651 156" stroke="#141416" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M640 132 L650 132 L654 156 L646 156 Z" fill="#141416"/>
  <path d="M500 134 C520 127 560 123 600 123 C620 123 632 125 638 129" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
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
