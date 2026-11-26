import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  RingGeometry,
  Scene,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Efeitos } from './efeitos';
import { corpoPorSecoes, haste, perfilDeAsa, placa, pneu, type Secao, tubo } from './formas';
import { type Caixa2D, projetarDeLado, texturaLateral, texturaQuadrada } from './lateral';
import { aparelhoForte, desenhoPorSoftware } from './suporte';

export type VariacaoDeAsa = 'padrao' | 'carga' | 'arrasto' | 'evolucao';
export type VariacaoDeAssoalho = 'padrao' | 'canais' | 'borda';
export type Composto = 'macio' | 'medio' | 'duro';

export interface Visual {
  asaDianteira: VariacaoDeAsa;
  asaTraseira: VariacaoDeAsa;
  assoalho: VariacaoDeAssoalho;
  pneus: Composto | null;
  patrocinio: string | null;
}

/**
 * A pintura do redesenho 2D das equipes: as laterais desenhadas (SVG de
 * 1000 x 300, bico para a direita e, espelhado, para a esquerda) e a cor de
 * cada peça que o desenho pinta à parte.
 */
export interface PinturaDoRedesenho {
  direita: string;
  esquerda: string;
  asaTraseira: string;
  flap: string;
  endplate: string;
  flapDianteiro: string;
  capacete: string;
  retrovisor: string;
  /** Onde fica o sidepod no desenho, para a pintura dele cair inteira no sidepod 3D. */
  sidepod: Caixa2D;
  /** A roda vista de lado (pneu com as letras da Pirelli e o aro da equipe) e o viewBox dela. */
  roda: { svg: string; caixa: string };
}

export interface Pintura {
  cor: string;
  corSecundaria: string;
  numero?: number;
  visual?: Partial<Visual>;
  redesenho?: PinturaDoRedesenho | undefined;
}

export type Ponto = readonly [number, number, number];

export interface PontoNaTela {
  x: number;
  y: number;
  visivel: boolean;
}

export interface Garagem {
  pintar: (pintura: Pintura) => void;
  abrirAsa: (aberta: boolean) => void;
  girar: (girando: boolean) => void;
  focar: (ponto: Ponto | null) => void;
  projetar: (ponto: Ponto) => PontoNaTela;
  destruir: () => void;
  /**
   * Verdadeiro quando o navegador desenha o 3D sem placa de vídeo (por
   * software). Nesse caso o carro fica parado até alguém arrastar: girando
   * sozinho, cada quadro travaria a página inteira.
   */
  leve: boolean;
}

export interface OpcoesDaGaragem {
  girando: boolean;
  /** Chamada a cada quadro desenhado, depois que a câmera ou o carro mudaram. */
  aoDesenhar?: () => void;
}

const CENTRO_DO_CARRO: Ponto = [0, 0.45, 0];

const FLAP_FECHADO = -0.7;
const FLAP_ABERTO = -0.05;

const VISUAL_PADRAO: Visual = {
  asaDianteira: 'padrao',
  asaTraseira: 'padrao',
  assoalho: 'padrao',
  pneus: null,
  patrocinio: null,
};

const COR_DO_COMPOSTO: Record<Composto, string> = {
  macio: '#ff2a14',
  medio: '#ffd100',
  duro: '#f4f4f5',
};

const ASA_TRASEIRA: Record<VariacaoDeAsa, { plano: number; flap: number }> = {
  padrao: { plano: 0.42, flap: 0.36 },
  carga: { plano: 0.52, flap: 0.46 },
  arrasto: { plano: 0.3, flap: 0.22 },
  evolucao: { plano: 0.42, flap: 0.36 },
};

function material(cor: string, rugosidade = 0.55) {
  return new MeshStandardMaterial({ color: cor, roughness: rugosidade, metalness: 0.1 });
}

// Pintura automotiva: base metálica com uma camada de verniz por cima, que
// devolve o reflexo nítido do estúdio mesmo onde a tinta é mais fosca.
function pinturaMetalica(cor: string, metalico = 0.45) {
  return new MeshPhysicalMaterial({
    color: cor,
    metalness: metalico,
    roughness: 0.36,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
}

// Trama sarja 2x2 da fibra de carbono, desenhada num canvas. Cada fio tem um
// degradê que imita o brilho que muda conforme o ângulo da luz.
function texturaDeTrama() {
  const lado = 128;
  const fio = 16;
  const tela = document.createElement('canvas');
  tela.width = lado;
  tela.height = lado;
  const contexto = tela.getContext('2d');

  if (contexto) {
    for (let linha = 0; linha < lado / fio; linha++) {
      for (let coluna = 0; coluna < lado / fio; coluna++) {
        const deitado = (linha + coluna) % 4 < 2;
        const x = coluna * fio;
        const y = linha * fio;
        const brilho = deitado
          ? contexto.createLinearGradient(x, y, x, y + fio)
          : contexto.createLinearGradient(x, y, x + fio, y);
        brilho.addColorStop(0, '#0c0c10');
        brilho.addColorStop(0.5, deitado ? '#3a3b44' : '#262730');
        brilho.addColorStop(1, '#0c0c10');
        contexto.fillStyle = brilho;
        contexto.fillRect(x, y, fio, fio);
      }
    }
  }

  const textura = new CanvasTexture(tela);
  textura.colorSpace = SRGBColorSpace;
  textura.wrapS = RepeatWrapping;
  textura.wrapT = RepeatWrapping;
  textura.repeat.set(6, 6);
  textura.anisotropy = 4;

  return textura;
}

function fibraDeCarbono() {
  const trama = texturaDeTrama();

  return new MeshPhysicalMaterial({
    map: trama,
    bumpMap: trama,
    bumpScale: 1.5,
    metalness: 0.25,
    roughness: 0.45,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });
}

function borracha() {
  return new MeshStandardMaterial({ color: '#18181b', roughness: 0.9, metalness: 0 });
}

function aroForjado(cor: string) {
  return new MeshStandardMaterial({ color: cor, roughness: 0.28, metalness: 0.85 });
}

function viseiraEspelhada() {
  return new MeshPhysicalMaterial({
    color: '#0b0b0f',
    metalness: 1,
    roughness: 0.06,
    iridescence: 1,
    iridescenceIOR: 1.8,
  });
}

function adesivo(textura: CanvasTexture, transparente = false) {
  return new MeshStandardMaterial({
    map: textura,
    transparent: transparente,
    roughness: 0.32,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}

function caixa(largura: number, altura: number, profundidade: number, cor: MeshStandardMaterial) {
  return new Mesh(new BoxGeometry(largura, altura, profundidade), cor);
}

const CORPO: Secao[] = [
  { x: 2.8, largura: 0.035, base: 0.19, topo: 0.25 },
  { x: 2.45, largura: 0.08, base: 0.17, topo: 0.31 },
  { x: 1.9, largura: 0.13, base: 0.16, topo: 0.38 },
  { x: 1.3, largura: 0.19, base: 0.15, topo: 0.46 },
  { x: 0.7, largura: 0.26, base: 0.15, topo: 0.53 },
  { x: 0.2, largura: 0.3, base: 0.15, topo: 0.56 },
  { x: -0.25, largura: 0.3, base: 0.15, topo: 0.6 },
  { x: -0.55, largura: 0.26, base: 0.15, topo: 0.88 },
  { x: -0.95, largura: 0.22, base: 0.15, topo: 0.84 },
  { x: -1.55, largura: 0.16, base: 0.15, topo: 0.64 },
  { x: -2.05, largura: 0.11, base: 0.16, topo: 0.46 },
  { x: -2.42, largura: 0.07, base: 0.18, topo: 0.32 },
];

// Sidepod no formato do redesenho 2D: alto e estreito na entrada, logo
// abaixo do halo, descendo em diagonal até a roda traseira. Embaixo dele
// fica o rebaixo, o vão por onde o ar corre até o difusor.
const SIDEPOD: Secao[] = [
  { x: 0.66, largura: 0.16, base: 0.42, topo: 0.64, centroZ: 0.48 },
  { x: 0.4, largura: 0.24, base: 0.34, topo: 0.63, centroZ: 0.5 },
  { x: -0.2, largura: 0.25, base: 0.26, topo: 0.57, centroZ: 0.47 },
  { x: -0.8, largura: 0.21, base: 0.2, topo: 0.49, centroZ: 0.36 },
  { x: -1.3, largura: 0.13, base: 0.18, topo: 0.4, centroZ: 0.22 },
  { x: -1.7, largura: 0.06, base: 0.18, topo: 0.3, centroZ: 0.12 },
];

function monocoque(pintura: MeshStandardMaterial) {
  return new Mesh(corpoPorSecoes(CORPO), pintura);
}

function sidepod(lado: number, pintura: MeshStandardMaterial, carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  const secoes = SIDEPOD.map((secao) => ({ ...secao, centroZ: lado * (secao.centroZ ?? 0) }));
  conjunto.add(new Mesh(corpoPorSecoes(secoes, 4), pintura));

  const entrada = new Mesh(new CircleGeometry(1, 32), carbono);
  entrada.scale.set(0.13, 0.09, 1);
  entrada.rotation.y = Math.PI / 2;
  entrada.position.set(0.665, 0.53, lado * 0.48);
  conjunto.add(entrada);

  return conjunto;
}

function barbatana(pintura: MeshStandardMaterial) {
  const geometria = placa(
    [
      [-0.62, 0.86],
      [-0.8, 0.9],
      [-2.3, 0.86],
      [-2.3, 0.4],
      [-1.6, 0.6],
      [-1.0, 0.8],
    ],
    0.012,
  );

  return new Mesh(geometria, pintura);
}

function halo(carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  conjunto.add(
    new Mesh(
      tubo(
        [
          [-0.3, 0.6, -0.27],
          [-0.05, 0.76, -0.26],
          [0.22, 0.8, -0.12],
          [0.3, 0.8, 0],
          [0.22, 0.8, 0.12],
          [-0.05, 0.76, 0.26],
          [-0.3, 0.6, 0.27],
        ],
        0.03,
      ),
      carbono,
    ),
  );
  conjunto.add(
    new Mesh(
      tubo(
        [
          [0.46, 0.55, 0],
          [0.4, 0.7, 0],
          [0.3, 0.8, 0],
        ],
        0.026,
      ),
      carbono,
    ),
  );

  return conjunto;
}

// Aletas na frente do assoalho, logo atrás das rodas dianteiras. Em 2026 o
// regulamento permite até três elementos e exige que joguem o ar para dentro,
// por isso a borda de trás fica mais perto do centro do carro.
function aletasDoAssoalho(lado: number, carbono: MeshStandardMaterial) {
  const conjunto = new Group();

  for (const [indice, altura] of [0.2, 0.16, 0.12].entries()) {
    const aleta = caixa(0.34, altura, 0.012, carbono);
    aleta.position.set(1.28 - indice * 0.12, 0.12 + altura / 2, lado * (0.74 - indice * 0.045));
    aleta.rotation.y = lado * 0.12;
    conjunto.add(aleta);
  }

  return conjunto;
}

// Câmera de TV em forma de T no alto do arco de proteção, que filma para a
// frente e para trás.
function cameraT(carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  const pe = caixa(0.05, 0.08, 0.025, carbono);
  pe.position.set(-0.56, 0.92, 0);
  conjunto.add(pe);

  const barra = caixa(0.06, 0.035, 0.2, carbono);
  barra.position.set(-0.56, 0.97, 0);
  conjunto.add(barra);

  return conjunto;
}

function retrovisor(lado: number, pintura: MeshStandardMaterial, carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  conjunto.add(new Mesh(haste([0.42, 0.5, lado * 0.42], [0.42, 0.64, lado * 0.52], 0.01), carbono));
  const carcaca = new Mesh(new SphereGeometry(1, 20, 12), pintura);
  carcaca.scale.set(0.04, 0.03, 0.075);
  carcaca.position.set(0.42, 0.65, lado * 0.55);
  conjunto.add(carcaca);

  return conjunto;
}

function suspensao(carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  const bracos: [Ponto, Ponto][] = [];

  for (const lado of [-1, 1]) {
    const [xf, xt] = [1.85, -1.65];
    bracos.push(
      [
        [xf + 0.25, 0.27, lado * 0.12],
        [xf, 0.3, lado * 0.68],
      ],
      [
        [xf - 0.3, 0.27, lado * 0.14],
        [xf, 0.3, lado * 0.68],
      ],
      [
        [xf + 0.22, 0.42, lado * 0.12],
        [xf, 0.46, lado * 0.66],
      ],
      [
        [xf - 0.25, 0.44, lado * 0.15],
        [xf, 0.46, lado * 0.66],
      ],
      [
        [xf - 0.05, 0.28, lado * 0.62],
        [xf - 0.15, 0.48, lado * 0.15],
      ],
      [
        [xt + 0.3, 0.24, lado * 0.16],
        [xt, 0.3, lado * 0.68],
      ],
      [
        [xt - 0.25, 0.24, lado * 0.1],
        [xt, 0.3, lado * 0.68],
      ],
      [
        [xt + 0.28, 0.4, lado * 0.14],
        [xt, 0.46, lado * 0.66],
      ],
      [
        [xt - 0.2, 0.4, lado * 0.08],
        [xt, 0.46, lado * 0.66],
      ],
    );
  }

  for (const [de, ate] of bracos) {
    conjunto.add(new Mesh(haste(de, ate), carbono));
  }

  return conjunto;
}

// Calota das rodas de 18 polegadas, com três pás em espiral saindo do centro
// nas cores da equipe, como as que giram na transmissão.
function texturaDaCalota(cor: string, corSecundaria: string) {
  const tela = document.createElement('canvas');
  tela.width = 256;
  tela.height = 256;
  const contexto = tela.getContext('2d');

  if (contexto) {
    const grau = Math.PI / 180;
    contexto.translate(128, 128);
    contexto.fillStyle = '#16161a';
    contexto.beginPath();
    contexto.arc(0, 0, 128, 0, Math.PI * 2);
    contexto.fill();

    const ponto = (raio: number, angulo: number) =>
      [Math.cos(angulo * grau) * raio, Math.sin(angulo * grau) * raio] as const;
    // Cada divisa entre as pás sai do miolo e encurva 60 graus até a borda.
    const divisa = (inicio: number) => ({
      dentro: ponto(36, inicio),
      controle: ponto(92, inicio + 12),
      fora: ponto(116, inicio + 60),
    });

    for (const [indice, preenchimento] of [cor, corSecundaria, '#d9dadf'].entries()) {
      const inicio = indice * 120;
      const comeco = divisa(inicio);
      const fim = divisa(inicio + 120);
      contexto.beginPath();
      contexto.moveTo(...comeco.dentro);
      contexto.quadraticCurveTo(...comeco.controle, ...comeco.fora);
      contexto.arc(0, 0, 116, (inicio + 60) * grau, (inicio + 180) * grau);
      contexto.quadraticCurveTo(...fim.controle, ...fim.dentro);
      contexto.arc(0, 0, 36, (inicio + 120) * grau, inicio * grau, true);
      contexto.closePath();
      contexto.fillStyle = preenchimento;
      contexto.fill();
      contexto.lineWidth = 4;
      contexto.strokeStyle = '#0c0c0f';
      contexto.stroke();
    }

    contexto.lineWidth = 8;
    contexto.strokeStyle = '#5a5c63';
    contexto.beginPath();
    contexto.arc(0, 0, 121, 0, Math.PI * 2);
    contexto.stroke();

    contexto.fillStyle = '#e9e9ee';
    contexto.beginPath();
    contexto.arc(0, 0, 34, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = '#16161a';
    contexto.beginPath();
    contexto.arc(0, 0, 24, 0, Math.PI * 2);
    contexto.fill();
  }

  const textura = new CanvasTexture(tela);
  textura.colorSpace = SRGBColorSpace;
  textura.anisotropy = 4;

  return textura;
}

function calota(cor: string, corSecundaria: string) {
  return new MeshPhysicalMaterial({
    map: texturaDaCalota(cor, corSecundaria),
    metalness: 0.2,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
}

function roda(
  x: number,
  z: number,
  aro: MeshStandardMaterial,
  capa: MeshStandardMaterial,
  composto: Composto | null,
  flanco: MeshStandardMaterial | null,
) {
  const conjunto = new Group();
  const lado = Math.sign(z);
  const traseira = x < 0;
  const largura = traseira ? 0.44 : 0.38;
  const borrachaDoPneu = borracha();
  borrachaDoPneu.side = DoubleSide;
  conjunto.add(new Mesh(pneu(0.36, largura, 0.235), borrachaDoPneu));

  const tambor = new Mesh(new CylinderGeometry(0.235, 0.235, largura * 0.9, 40, 1, true), aro);
  tambor.rotation.x = Math.PI / 2;
  conjunto.add(tambor);

  for (const face of [-1, 1]) {
    const cobertura = new Mesh(new CircleGeometry(0.236, 64), face === lado ? capa : aro);
    cobertura.position.z = face * largura * 0.43;
    cobertura.rotation.y = face === 1 ? 0 : Math.PI;
    conjunto.add(cobertura);
  }

  const porca = new Mesh(new CylinderGeometry(0.03, 0.034, 0.03, 6), aro);
  porca.rotation.x = Math.PI / 2;
  porca.position.z = lado * (largura * 0.43 + 0.012);
  conjunto.add(porca);

  // O flanco desenhado: o pneu com as letras da Pirelli e o aro da equipe,
  // colado por fora da roda. O desenho tem a roda com raio 70 num quadro de
  // 150, então o disco é um pouco maior que o pneu e a sobra é transparente.
  if (flanco) {
    const desenho = new Mesh(new CircleGeometry((0.36 * 75) / 70, 64), flanco);
    desenho.position.z = lado * (largura / 2 + 0.004);
    desenho.rotation.y = lado === 1 ? 0 : Math.PI;
    conjunto.add(desenho);
  }

  if (composto) {
    const faixa = new Mesh(
      new TorusGeometry(flanco ? 0.272 : 0.3, flanco ? 0.008 : 0.014, 8, 64),
      material(COR_DO_COMPOSTO[composto], 0.6),
    );
    faixa.position.z = lado * (largura / 2 + (flanco ? 0.006 : -0.005));
    conjunto.add(faixa);
  }
  conjunto.position.set(x, 0.36, z);

  return conjunto;
}

function texturaDoNumero(numero: number, cor: string) {
  const tela = document.createElement('canvas');
  tela.width = 256;
  tela.height = 256;
  const contexto = tela.getContext('2d');

  if (contexto) {
    contexto.fillStyle = cor;
    contexto.font = '800 170px "Segoe UI", system-ui, sans-serif';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(String(numero), 128, 136);
  }

  const textura = new CanvasTexture(tela);
  textura.colorSpace = SRGBColorSpace;

  return textura;
}

function texturaDoPatrocinio(texto: string, fundo: string, cor: string) {
  const tela = document.createElement('canvas');
  tela.width = 512;
  tela.height = 128;
  const contexto = tela.getContext('2d');

  if (contexto) {
    contexto.fillStyle = fundo;
    contexto.fillRect(0, 0, 512, 128);
    contexto.fillStyle = cor;
    contexto.font = 'italic 800 64px "Segoe UI", system-ui, sans-serif';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(texto.toUpperCase(), 256, 68, 480);
  }

  const textura = new CanvasTexture(tela);
  textura.colorSpace = SRGBColorSpace;

  return textura;
}

function corDoTexto(fundo: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((inicio) =>
    Number.parseInt(fundo.slice(inicio, inicio + 2), 16),
  );

  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0a0a0b' : '#ffffff';
}

function asaDianteira(
  variacao: VariacaoDeAsa,
  detalhe: MeshStandardMaterial,
  carbono: MeshStandardMaterial,
  placas = detalhe,
) {
  const conjunto = new Group();
  const elementos = { padrao: 2, carga: 3, arrasto: 1, evolucao: 4 }[variacao];
  const espessura = variacao === 'arrasto' ? 0.08 : 0.12;

  for (let indice = 0; indice < elementos; indice++) {
    const elemento = new Mesh(
      perfilDeAsa(0.42 - indice * 0.07, 1.92 - indice * 0.04, espessura),
      indice === 0 ? carbono : detalhe,
    );
    elemento.position.set(2.92 - indice * 0.22, 0.1 + indice * 0.055, 0);
    elemento.rotation.z = 0.06 + indice * 0.17;
    conjunto.add(elemento);
  }

  for (const lado of [-1, 1]) {
    const placaLateral = new Mesh(
      placa(
        [
          [2.95, 0.06],
          [2.3, 0.06],
          [2.25, 0.26],
          [2.6, 0.32],
          [2.95, 0.18],
        ],
        0.02,
      ),
      placas,
    );
    placaLateral.position.z = lado * 0.97;
    conjunto.add(placaLateral);
  }

  for (const lado of [-1, 1]) {
    conjunto.add(
      new Mesh(haste([2.55, 0.12, lado * 0.06], [2.5, 0.22, lado * 0.05], 0.012), carbono),
    );
  }

  return conjunto;
}

function assoalho(
  variacao: VariacaoDeAssoalho,
  carbono: MeshStandardMaterial,
  detalhe: MeshStandardMaterial,
) {
  const conjunto = new Group();
  const meia = variacao === 'borda' ? 0.81 : 0.75;
  const contorno = new Shape(
    [
      [1.35, 0.3],
      [0.95, meia * 0.9],
      [0.6, meia],
      [-1.2, meia],
      [-1.45, meia * 0.62],
      [-2.2, meia * 0.55],
      [-2.3, 0.25],
      [-2.3, -0.25],
      [-2.2, -meia * 0.55],
      [-1.45, -meia * 0.62],
      [-1.2, -meia],
      [0.6, -meia],
      [0.95, -meia * 0.9],
      [1.35, -0.3],
    ].map(([x = 0, z = 0]) => new Vector2(x, z)),
  );
  const geometria = new ExtrudeGeometry(contorno, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 1,
  });
  geometria.rotateX(Math.PI / 2);
  const base = new Mesh(geometria, material('#121216', 0.7));
  base.position.y = 0.14;
  conjunto.add(base);

  const difusor = caixa(0.5, 0.02, meia * 1.05, carbono);
  difusor.position.set(-2.25, 0.2, 0);
  difusor.rotation.z = -0.32;
  conjunto.add(difusor);

  if (variacao === 'canais') {
    for (const z of [-0.5, -0.25, 0.25, 0.5]) {
      const aleta = caixa(0.7, 0.1, 0.03, detalhe);
      aleta.position.set(1.05, 0.17, z);
      conjunto.add(aleta);
    }
  }

  if (variacao === 'borda') {
    for (const lado of [-1, 1]) {
      const borda = caixa(2.6, 0.06, 0.05, detalhe);
      borda.position.set(-0.3, 0.16, lado * 0.8);
      conjunto.add(borda);
    }
  }

  return conjunto;
}

// Leva a pintura desenhada para as laterais: a peça ganha coordenadas de
// textura de lado e o material recebe o desenho assim que ele fica pronto.
function pintarDeLado(objeto: Object3D, lataria: MeshPhysicalMaterial, caixa?: Caixa2D) {
  const malha = objeto instanceof Mesh ? objeto : objeto.children[0];

  if (malha instanceof Mesh) {
    malha.geometry = projetarDeLado(malha.geometry, caixa);
    malha.material = lataria;
  }

  return objeto;
}

function carro(
  { cor, corSecundaria, numero, visual: pedido, redesenho }: Pintura,
  aoMudar: () => void = () => undefined,
) {
  const visual = { ...VISUAL_PADRAO, ...pedido };
  const pintura = pinturaMetalica(cor);
  const detalhe = pinturaMetalica(corSecundaria, 0.3);
  const carbono = fibraDeCarbono();
  const conjunto = new Group();
  const patrocinio = visual.patrocinio
    ? adesivo(texturaDoPatrocinio(visual.patrocinio, corSecundaria, corDoTexto(corSecundaria)))
    : null;
  // A lataria com o desenho é acetinada, como a pintura dos carros atuais.
  // Com o verniz espelhado das outras peças, um carro escuro parecia cromado
  // visto de cima e de trás, e o rebaixo do sidepod virava uma faixa branca.
  const lataria = new MeshPhysicalMaterial({
    color: cor,
    metalness: 0.1,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.5,
  });
  const cores = {
    asaTraseira: redesenho ? pinturaMetalica(redesenho.asaTraseira) : pintura,
    flap: redesenho ? pinturaMetalica(redesenho.flap, 0.3) : detalhe,
    endplate: redesenho ? pinturaMetalica(redesenho.endplate, 0.3) : detalhe,
    flapDianteiro: redesenho ? pinturaMetalica(redesenho.flapDianteiro, 0.3) : detalhe,
    capacete: redesenho ? pinturaMetalica(redesenho.capacete, 0.3) : detalhe,
    retrovisor: redesenho ? pinturaMetalica(redesenho.retrovisor) : pintura,
  };

  if (redesenho) {
    texturaLateral(redesenho.direita, redesenho.esquerda, (textura) => {
      lataria.map = textura;
      lataria.color.set('#ffffff');
      lataria.needsUpdate = true;
      aoMudar();
    });
  }

  const pintarSeTiver = (objeto: Object3D, caixa?: Caixa2D) =>
    redesenho ? pintarDeLado(objeto, lataria, caixa) : objeto;

  conjunto.add(pintarSeTiver(monocoque(pintura)));
  conjunto.add(pintarSeTiver(barbatana(pintura)));
  conjunto.add(assoalho(visual.assoalho, carbono, detalhe));
  conjunto.add(halo(carbono));
  conjunto.add(suspensao(carbono));
  conjunto.add(cameraT(carbono));

  const cockpit = new Mesh(new CircleGeometry(1, 40), material('#08080a', 0.8));
  cockpit.scale.set(0.38, 0.19, 1);
  cockpit.rotation.x = -Math.PI / 2;
  cockpit.position.set(0.05, 0.598, 0);
  conjunto.add(cockpit);

  const tomadaDeAr = new Mesh(new CircleGeometry(1, 32), material('#08080a', 0.8));
  tomadaDeAr.scale.set(0.09, 0.07, 1);
  tomadaDeAr.rotation.y = Math.PI / 2 - 0.5;
  tomadaDeAr.position.set(-0.4, 0.8, 0);
  conjunto.add(tomadaDeAr);

  for (const lado of [-1, 1]) {
    conjunto.add(pintarSeTiver(sidepod(lado, pintura, carbono), redesenho?.sidepod));
    conjunto.add(retrovisor(lado, cores.retrovisor, carbono));
    conjunto.add(aletasDoAssoalho(lado, carbono));

    const placaTraseira = new Mesh(
      placa(
        [
          [-2.08, 0.32],
          [-2.12, 1.02],
          [-2.62, 1.02],
          [-2.68, 0.5],
          [-2.55, 0.32],
        ],
        0.025,
      ),
      cores.asaTraseira,
    );
    placaTraseira.position.z = lado * 0.8;
    conjunto.add(placaTraseira);

    // A pintura do redesenho já traz o número desenhado nas laterais.
    if (numero !== undefined && !redesenho) {
      const numeroNaBarbatana = new Mesh(
        new PlaneGeometry(0.3, 0.3),
        adesivo(texturaDoNumero(numero, corSecundaria), true),
      );
      numeroNaBarbatana.position.set(-1.55, 0.7, lado * 0.012);
      numeroNaBarbatana.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(numeroNaBarbatana);

      const numeroNoBico = new Mesh(
        new PlaneGeometry(0.16, 0.16),
        adesivo(texturaDoNumero(numero, corSecundaria), true),
      );
      numeroNoBico.position.set(2.1, 0.37, lado * 0.075);
      numeroNoBico.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      numeroNoBico.visible = lado === 1;
      conjunto.add(numeroNoBico);
    }

    if (patrocinio) {
      const naLateral = new Mesh(new PlaneGeometry(0.6, 0.15), patrocinio);
      naLateral.position.set(0.1, 0.34, lado * 0.735);
      naLateral.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(naLateral);

      const naPlaca = new Mesh(new PlaneGeometry(0.44, 0.12), patrocinio);
      naPlaca.position.set(-2.38, 0.88, lado * 0.82);
      naPlaca.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(naPlaca);
    }
  }

  conjunto.add(asaDianteira(visual.asaDianteira, cores.flapDianteiro, carbono, cores.endplate));

  const asa = ASA_TRASEIRA[visual.asaTraseira];
  const planoTraseiro = new Mesh(perfilDeAsa(asa.plano, 1.58, 0.11), cores.asaTraseira);
  planoTraseiro.position.set(-2.38 + asa.plano / 2, 0.82, 0);
  planoTraseiro.rotation.z = 0.12;
  conjunto.add(planoTraseiro);

  if (visual.asaTraseira === 'evolucao') {
    const planoInferior = new Mesh(perfilDeAsa(0.3, 1.2, 0.1), carbono);
    planoInferior.position.set(-2.17, 0.44, 0);
    planoInferior.rotation.z = 0.1;
    conjunto.add(planoInferior);
  }

  const flap = new Mesh(perfilDeAsa(asa.flap, 1.58, 0.1), cores.flap);
  const dobradica = new Group();
  dobradica.position.set(-2.18, 0.9, 0);
  dobradica.rotation.z = FLAP_FECHADO;
  dobradica.add(flap);
  conjunto.add(dobradica);

  for (const lado of [-1, 1]) {
    conjunto.add(
      new Mesh(haste([-2.15, 0.36, lado * 0.06], [-2.32, 0.84, lado * 0.08], 0.02), carbono),
    );
  }

  // Luzes traseiras. A de chuva fica na ponta da estrutura de impacto, acima
  // do difusor, numa caixa de carbono. Desde 2026 as placas da asa também têm
  // uma faixa de luz na borda de trás, que mostra o estado da parte elétrica.
  const luz = new MeshStandardMaterial({
    color: '#ff2a14',
    emissive: '#ff2a14',
    emissiveIntensity: 0.9,
  });
  const caixaDaLuz = new Mesh(new BoxGeometry(0.07, 0.1, 0.17), carbono);
  caixaDaLuz.position.set(-2.43, 0.34, 0);
  conjunto.add(caixaDaLuz);

  const luzDeChuva = new Mesh(new BoxGeometry(0.02, 0.07, 0.14), luz);
  luzDeChuva.position.set(-2.47, 0.34, 0);
  conjunto.add(luzDeChuva);

  for (const lado of [-1, 1]) {
    const luzDaPlaca = new Mesh(new BoxGeometry(0.014, 0.34, 0.04), luz);
    luzDaPlaca.position.set(-2.66, 0.77, lado * 0.8);
    luzDaPlaca.rotation.z = 0.115;
    conjunto.add(luzDaPlaca);
  }

  const capacete = new Mesh(new SphereGeometry(0.16, 32, 20), cores.capacete);
  capacete.position.set(-0.05, 0.68, 0);
  conjunto.add(capacete);

  const viseira = new Mesh(
    new SphereGeometry(0.165, 32, 20, (3 * Math.PI) / 4, Math.PI / 2, Math.PI / 2.6, Math.PI / 5),
    viseiraEspelhada(),
  );
  viseira.position.copy(capacete.position);
  conjunto.add(viseira);

  const aro = aroForjado('#2a2b30');
  const capa = calota(cor, corSecundaria);
  const flanco = redesenho
    ? new MeshStandardMaterial({
        transparent: true,
        opacity: 0,
        roughness: 0.6,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      })
    : null;

  if (redesenho && flanco) {
    texturaQuadrada(redesenho.roda.svg, redesenho.roda.caixa, (textura) => {
      flanco.map = textura;
      flanco.opacity = 1;
      flanco.needsUpdate = true;
      aoMudar();
    });
  }
  for (const [x, z] of [
    [1.85, 0.86],
    [1.85, -0.86],
    [-1.65, 0.86],
    [-1.65, -0.86],
  ] as const) {
    conjunto.add(roda(x, z, aro, capa, visual.pneus, flanco));
  }

  conjunto.traverse((objeto) => {
    if (objeto instanceof Mesh) {
      objeto.castShadow = true;
      objeto.receiveShadow = true;
    }
  });

  return { conjunto, dobradica };
}

function chao() {
  const conjunto = new Group();
  const base = new Mesh(
    new CircleGeometry(4.2, 96),
    new MeshStandardMaterial({
      color: '#0b0b0d',
      roughness: 0.85,
      metalness: 0,
      envMapIntensity: 0.18,
    }),
  );
  base.rotation.x = -Math.PI / 2;
  base.receiveShadow = true;

  // Sombra de contato: escurece o piso logo abaixo do carro, onde quase não
  // chega luz, e assenta o carro no chão.
  const contato = new Mesh(
    new PlaneGeometry(6.4, 2.8),
    new MeshBasicMaterial({
      map: texturaDaSombraDeContato(),
      transparent: true,
      depthWrite: false,
    }),
  );
  contato.rotation.x = -Math.PI / 2;
  contato.position.y = 0.003;

  const borda = new Mesh(
    new RingGeometry(4.15, 4.22, 64),
    new MeshBasicMaterial({ color: '#ff2a14', side: DoubleSide, transparent: true, opacity: 0.6 }),
  );
  borda.rotation.x = -Math.PI / 2;
  borda.position.y = 0.005;

  conjunto.add(base, contato, borda);

  return conjunto;
}

function texturaDaSombraDeContato() {
  const tela = document.createElement('canvas');
  tela.width = 256;
  tela.height = 128;
  const contexto = tela.getContext('2d');

  if (contexto) {
    contexto.translate(128, 64);
    contexto.scale(2, 1);
    const sombra = contexto.createRadialGradient(0, 0, 0, 0, 0, 64);
    sombra.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    sombra.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
    sombra.addColorStop(1, 'rgba(0, 0, 0, 0)');
    contexto.fillStyle = sombra;
    contexto.fillRect(-64, -64, 128, 128);
  }

  return new CanvasTexture(tela);
}

function liberar(raiz: Object3D) {
  raiz.traverse((objeto) => {
    if (objeto instanceof Mesh) {
      objeto.geometry.dispose();
      const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material];

      for (const usado of materiais) {
        for (const valor of Object.values(usado)) {
          if (valor instanceof Texture) {
            valor.dispose();
          }
        }

        usado.dispose();
      }
    }
  });
}

// Quadros acima disso (menos de 40 por segundo) fazem a qualidade baixar um
// degrau: primeiro saem os efeitos, depois a resolução cai até 1x.
const QUADRO_LENTO_MS = 25;
const QUADROS_PARA_AVALIAR = 45;

export function montarGaragem(
  recipiente: HTMLElement,
  pintura: Pintura,
  { girando, aoDesenhar }: OpcoesDaGaragem,
): Garagem {
  const renderizador = new WebGLRenderer({ antialias: true, alpha: true });
  const leve = desenhoPorSoftware();
  let resolucao = leve ? 1 : Math.min(window.devicePixelRatio, 2);
  renderizador.setPixelRatio(resolucao);
  renderizador.outputColorSpace = SRGBColorSpace;
  // Tone mapping neutro (Khronos PBR Neutral): segura os brilhos fortes sem
  // desbotar nem desviar as cores das equipes.
  renderizador.toneMapping = NeutralToneMapping;
  renderizador.shadowMap.enabled = !leve;
  renderizador.shadowMap.type = PCFShadowMap;
  // A luz e o carro ficam parados; só a câmera gira. A sombra é refeita só
  // quando o carro muda ou o flap se mexe, e não a cada quadro.
  renderizador.shadowMap.autoUpdate = false;
  renderizador.shadowMap.needsUpdate = true;
  recipiente.append(renderizador.domElement);

  const cena = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(6.4, 3.2, 6.4);

  // Reflexos de um estúdio fotográfico gerado no próprio navegador: nada de
  // arquivo HDRI para baixar e nenhuma licença envolvida.
  const geradorDeReflexos = new PMREMGenerator(renderizador);
  const estudio = new RoomEnvironment();
  const reflexos = geradorDeReflexos.fromScene(estudio, 0.04).texture;
  cena.environment = reflexos;
  cena.environmentIntensity = 0.9;
  estudio.dispose();
  geradorDeReflexos.dispose();

  cena.add(new HemisphereLight(new Color('#ffffff'), new Color('#20202a'), 0.35));

  const sol = new DirectionalLight('#ffffff', 2.4);
  sol.position.set(3, 9, 4);
  sol.castShadow = !leve;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.radius = 4;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  Object.assign(sol.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  sol.shadow.camera.updateProjectionMatrix();
  cena.add(sol);

  const contraluz = new DirectionalLight('#cfe0ff', 1.2);
  contraluz.position.set(-6, 4, -5);
  cena.add(contraluz);

  // Só desenha um quadro novo quando algo mudou: câmera, flap, carro,
  // tamanho ou uma pintura que acabou de carregar. Parado, o 3D não gasta nada.
  let pedido = true;
  const pedirQuadro = () => {
    pedido = true;
  };
  const refazerSombra = () => {
    renderizador.shadowMap.needsUpdate = true;
    pedido = true;
  };

  let atual = carro(pintura, pedirQuadro);
  const paraLiberar: Object3D[] = [];
  cena.add(chao(), atual.conjunto);

  const controles = new OrbitControls(camera, renderizador.domElement);
  controles.target.set(...CENTRO_DO_CARRO);
  controles.enableDamping = true;
  controles.enablePan = false;
  controles.minDistance = 5;
  controles.maxDistance = 13;
  controles.maxPolarAngle = Math.PI / 2.15;
  controles.autoRotate = girando && !leve;
  controles.autoRotateSpeed = 1.1;
  controles.addEventListener('change', pedirQuadro);

  let anguloDesejado = FLAP_FECHADO;
  const alvoDesejado = new Vector3(...CENTRO_DO_CARRO);
  const projetado = new Vector3();

  function ajustar() {
    const { clientWidth: largura, clientHeight: altura } = recipiente;

    if (largura === 0 || altura === 0) {
      return;
    }

    renderizador.setSize(largura, altura);
    efeitos?.ajustar(largura, altura);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
    pedido = true;
  }

  let efeitos: Efeitos | null = null;
  let destruida = false;
  // Vira verdadeiro quando a qualidade baixou: os efeitos não voltam mais.
  let reduzida = false;

  if (!leve && aparelhoForte()) {
    void import('./efeitos').then(({ criarEfeitos }) => {
      if (destruida || reduzida) {
        return;
      }

      const { clientWidth: largura, clientHeight: altura } = recipiente;
      efeitos = criarEfeitos(renderizador, cena, camera, largura || 1, altura || 1);
      pedido = true;
    });
  }

  // Qualidade que se ajusta: se o aparelho não segura 40 quadros por segundo
  // com o carro girando, tira os efeitos e depois baixa a resolução.
  let ultimoQuadro = 0;
  let somaDosQuadros = 0;
  let quadrosSeguidos = 0;

  function medir(agora: number) {
    const intervalo = agora - ultimoQuadro;
    ultimoQuadro = agora;

    // Um intervalo longo é pausa (carro parado, aba escondida), não lentidão.
    if (intervalo > 250) {
      somaDosQuadros = 0;
      quadrosSeguidos = 0;
      return;
    }

    somaDosQuadros += intervalo;
    quadrosSeguidos += 1;

    if (quadrosSeguidos < QUADROS_PARA_AVALIAR) {
      return;
    }

    const media = somaDosQuadros / quadrosSeguidos;
    somaDosQuadros = 0;
    quadrosSeguidos = 0;

    if (media <= QUADRO_LENTO_MS) {
      return;
    }

    if (efeitos) {
      efeitos.destruir();
      efeitos = null;
      reduzida = true;
    } else if (resolucao > 1) {
      resolucao = Math.max(1, resolucao - 0.5);
      renderizador.setPixelRatio(resolucao);
      ajustar();
    }
  }

  function quadro(agora: number) {
    const angulo = atual.dobradica.rotation.z;

    if (Math.abs(anguloDesejado - angulo) > 0.0005) {
      atual.dobradica.rotation.z += (anguloDesejado - angulo) * 0.12;
      refazerSombra();
    }

    if (controles.target.distanceToSquared(alvoDesejado) > 1e-7) {
      controles.target.lerp(alvoDesejado, 0.08);
    }

    // Dispara 'change' (e pede um quadro) quando a câmera se mexe.
    controles.update();

    if (!pedido) {
      ultimoQuadro = 0;
      return;
    }

    pedido = false;

    if (ultimoQuadro > 0) {
      medir(agora);
    } else {
      ultimoQuadro = agora;
    }

    if (efeitos) {
      efeitos.renderizar();
    } else {
      renderizador.render(cena, camera);
    }

    // O carro antigo só é liberado depois que o novo foi desenhado: assim os
    // shaders que os dois usam continuam prontos e a troca de peça não
    // recompila nada.
    for (const antigo of paraLiberar.splice(0)) {
      liberar(antigo);
    }

    aoDesenhar?.();
  }

  // Fora da tela, nem o laço de animação roda.
  let naTela = true;
  let compilado = false;
  const vigia = new IntersectionObserver(([entrada]) => {
    const agora = entrada?.isIntersecting ?? true;

    if (agora === naTela) {
      return;
    }

    naTela = agora;
    pedido = true;
    ultimoQuadro = 0;

    if (compilado) {
      renderizador.setAnimationLoop(naTela ? quadro : null);
    }
  });
  vigia.observe(recipiente);

  const observador = new ResizeObserver(ajustar);
  observador.observe(recipiente);
  ajustar();

  // Os shaders são compilados em segundo plano quando o navegador deixa
  // (KHR_parallel_shader_compile); a página não congela enquanto o 3D chega.
  void renderizador
    .compileAsync(cena, camera)
    .catch(() => undefined)
    .then(() => {
      compilado = true;

      if (!destruida && naTela) {
        renderizador.setAnimationLoop(quadro);
      }
    });

  return {
    leve,
    pintar: (nova) => {
      const angulo = atual.dobradica.rotation.z;
      cena.remove(atual.conjunto);
      paraLiberar.push(atual.conjunto);
      atual = carro(nova, pedirQuadro);
      atual.dobradica.rotation.z = angulo;
      cena.add(atual.conjunto);
      refazerSombra();
    },
    abrirAsa: (aberta) => {
      anguloDesejado = aberta ? FLAP_ABERTO : FLAP_FECHADO;
    },
    girar: (ativo) => {
      controles.autoRotate = ativo;
      pedido = true;
    },
    focar: (ponto) => {
      alvoDesejado.set(...(ponto ?? CENTRO_DO_CARRO));
    },
    projetar: (ponto) => {
      projetado.set(...ponto).project(camera);

      return {
        x: ((projetado.x + 1) / 2) * recipiente.clientWidth,
        y: ((1 - projetado.y) / 2) * recipiente.clientHeight,
        visivel: projetado.z < 1,
      };
    },
    destruir: () => {
      destruida = true;
      renderizador.setAnimationLoop(null);
      efeitos?.destruir();
      vigia.disconnect();
      observador.disconnect();
      controles.removeEventListener('change', pedirQuadro);
      controles.dispose();
      paraLiberar.forEach(liberar);
      liberar(cena);
      reflexos.dispose();
      renderizador.dispose();
      renderizador.domElement.remove();
    },
  };
}
