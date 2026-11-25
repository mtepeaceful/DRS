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
import { corpoPorSecoes, haste, perfilDeAsa, placa, pneu, type Secao, tubo } from './formas';

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

export interface Pintura {
  cor: string;
  corSecundaria: string;
  numero?: number;
  visual?: Partial<Visual>;
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

const SIDEPOD: Secao[] = [
  { x: 0.64, largura: 0.2, base: 0.2, topo: 0.49, centroZ: 0.5 },
  { x: 0.35, largura: 0.24, base: 0.16, topo: 0.52, centroZ: 0.5 },
  { x: -0.25, largura: 0.24, base: 0.16, topo: 0.48, centroZ: 0.46 },
  { x: -0.9, largura: 0.2, base: 0.16, topo: 0.38, centroZ: 0.34 },
  { x: -1.5, largura: 0.12, base: 0.16, topo: 0.28, centroZ: 0.2 },
  { x: -1.85, largura: 0.06, base: 0.17, topo: 0.22, centroZ: 0.12 },
];

function monocoque(pintura: MeshStandardMaterial) {
  return new Mesh(corpoPorSecoes(CORPO), pintura);
}

function sidepod(lado: number, pintura: MeshStandardMaterial, carbono: MeshStandardMaterial) {
  const conjunto = new Group();
  const secoes = SIDEPOD.map((secao) => ({ ...secao, centroZ: lado * (secao.centroZ ?? 0) }));
  conjunto.add(new Mesh(corpoPorSecoes(secoes, 4), pintura));

  const entrada = new Mesh(new CircleGeometry(1, 32), carbono);
  entrada.scale.set(0.17, 0.1, 1);
  entrada.rotation.y = Math.PI / 2;
  entrada.position.set(0.645, 0.35, lado * 0.5);
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

function roda(x: number, z: number, aro: MeshStandardMaterial, composto: Composto | null) {
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

  const fundo = new Mesh(new CircleGeometry(0.235, 40), material('#0d0d10', 0.6));
  fundo.position.z = lado * (largura * 0.2);
  fundo.rotation.y = lado === 1 ? 0 : Math.PI;
  conjunto.add(fundo);

  const raios = 10;
  for (let indice = 0; indice < raios; indice++) {
    const angulo = (indice / raios) * Math.PI * 2;
    const raio = new Mesh(new BoxGeometry(0.16, 0.022, 0.03), aro);
    raio.position.set(Math.cos(angulo) * 0.13, Math.sin(angulo) * 0.13, lado * largura * 0.36);
    raio.rotation.z = angulo;
    conjunto.add(raio);
  }

  const cubo = new Mesh(new CylinderGeometry(0.055, 0.055, 0.06, 24), aro);
  cubo.rotation.x = Math.PI / 2;
  cubo.position.z = lado * largura * 0.4;
  conjunto.add(cubo);

  if (composto) {
    const faixa = new Mesh(
      new TorusGeometry(0.3, 0.014, 8, 64),
      material(COR_DO_COMPOSTO[composto], 0.6),
    );
    faixa.position.z = lado * (largura / 2 - 0.005);
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
      detalhe,
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

function carro({ cor, corSecundaria, numero, visual: pedido }: Pintura) {
  const visual = { ...VISUAL_PADRAO, ...pedido };
  const pintura = pinturaMetalica(cor);
  const detalhe = pinturaMetalica(corSecundaria, 0.3);
  const carbono = fibraDeCarbono();
  const conjunto = new Group();
  const patrocinio = visual.patrocinio
    ? adesivo(texturaDoPatrocinio(visual.patrocinio, corSecundaria, corDoTexto(corSecundaria)))
    : null;

  conjunto.add(monocoque(pintura));
  conjunto.add(barbatana(pintura));
  conjunto.add(assoalho(visual.assoalho, carbono, detalhe));
  conjunto.add(halo(carbono));
  conjunto.add(suspensao(carbono));

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
    conjunto.add(sidepod(lado, pintura, carbono));
    conjunto.add(retrovisor(lado, pintura, carbono));

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
      pintura,
    );
    placaTraseira.position.z = lado * 0.8;
    conjunto.add(placaTraseira);

    if (numero !== undefined) {
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

  conjunto.add(asaDianteira(visual.asaDianteira, detalhe, carbono));

  const asa = ASA_TRASEIRA[visual.asaTraseira];
  const planoTraseiro = new Mesh(perfilDeAsa(asa.plano, 1.58, 0.11), pintura);
  planoTraseiro.position.set(-2.38 + asa.plano / 2, 0.82, 0);
  planoTraseiro.rotation.z = 0.12;
  conjunto.add(planoTraseiro);

  if (visual.asaTraseira === 'evolucao') {
    const planoInferior = new Mesh(perfilDeAsa(0.3, 1.2, 0.1), carbono);
    planoInferior.position.set(-2.17, 0.44, 0);
    planoInferior.rotation.z = 0.1;
    conjunto.add(planoInferior);
  }

  const flap = new Mesh(perfilDeAsa(asa.flap, 1.58, 0.1), detalhe);
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

  const luzDeChuva = new Mesh(
    new BoxGeometry(0.03, 0.06, 0.12),
    new MeshStandardMaterial({ color: '#ff2a14', emissive: '#ff2a14', emissiveIntensity: 1.5 }),
  );
  luzDeChuva.position.set(-2.44, 0.26, 0);
  conjunto.add(luzDeChuva);

  const capacete = new Mesh(new SphereGeometry(0.16, 32, 20), detalhe);
  capacete.position.set(-0.05, 0.68, 0);
  conjunto.add(capacete);

  const viseira = new Mesh(
    new SphereGeometry(0.165, 32, 20, -Math.PI / 4, Math.PI / 2, Math.PI / 2.6, Math.PI / 5),
    viseiraEspelhada(),
  );
  viseira.position.copy(capacete.position);
  conjunto.add(viseira);

  const aro = aroForjado(corSecundaria);
  for (const [x, z] of [
    [1.85, 0.86],
    [1.85, -0.86],
    [-1.65, 0.86],
    [-1.65, -0.86],
  ] as const) {
    conjunto.add(roda(x, z, aro, visual.pneus));
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

export function montarGaragem(
  recipiente: HTMLElement,
  pintura: Pintura,
  { girando }: { girando: boolean },
): Garagem {
  const renderizador = new WebGLRenderer({ antialias: true, alpha: true });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderizador.outputColorSpace = SRGBColorSpace;
  // Tone mapping neutro (Khronos PBR Neutral): segura os brilhos fortes sem
  // desbotar nem desviar as cores das equipes.
  renderizador.toneMapping = NeutralToneMapping;
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = PCFShadowMap;
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
  sol.castShadow = true;
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

  let atual = carro(pintura);
  cena.add(chao(), atual.conjunto);

  const controles = new OrbitControls(camera, renderizador.domElement);
  controles.target.set(...CENTRO_DO_CARRO);
  controles.enableDamping = true;
  controles.enablePan = false;
  controles.minDistance = 5;
  controles.maxDistance = 13;
  controles.maxPolarAngle = Math.PI / 2.15;
  controles.autoRotate = girando;
  controles.autoRotateSpeed = 1.1;

  let anguloDesejado = FLAP_FECHADO;
  const alvoDesejado = new Vector3(...CENTRO_DO_CARRO);
  const projetado = new Vector3();

  function ajustar() {
    const { clientWidth: largura, clientHeight: altura } = recipiente;

    if (largura === 0 || altura === 0) {
      return;
    }

    renderizador.setSize(largura, altura);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
  }

  const observador = new ResizeObserver(ajustar);
  observador.observe(recipiente);
  ajustar();

  renderizador.setAnimationLoop(() => {
    atual.dobradica.rotation.z += (anguloDesejado - atual.dobradica.rotation.z) * 0.12;
    controles.target.lerp(alvoDesejado, 0.08);
    controles.update();
    renderizador.render(cena, camera);
  });

  return {
    pintar: (nova) => {
      const angulo = atual.dobradica.rotation.z;
      cena.remove(atual.conjunto);
      liberar(atual.conjunto);
      atual = carro(nova);
      atual.dobradica.rotation.z = angulo;
      cena.add(atual.conjunto);
    },
    abrirAsa: (aberta) => {
      anguloDesejado = aberta ? FLAP_ABERTO : FLAP_FECHADO;
    },
    girar: (ativo) => {
      controles.autoRotate = ativo;
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
      renderizador.setAnimationLoop(null);
      observador.disconnect();
      controles.dispose();
      liberar(cena);
      reflexos.dispose();
      renderizador.dispose();
      renderizador.domElement.remove();
    },
  };
}
