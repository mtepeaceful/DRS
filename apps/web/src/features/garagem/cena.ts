import {
  AmbientLight,
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
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

const CARBONO = '#1c1c22';
const BORRACHA = '#111114';
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
  return new MeshStandardMaterial({
    color: cor,
    roughness: rugosidade,
    metalness: 0.15,
    flatShading: true,
  });
}

function caixa(largura: number, altura: number, profundidade: number, cor: MeshStandardMaterial) {
  return new Mesh(new BoxGeometry(largura, altura, profundidade), cor);
}

function monocoque(pintura: MeshStandardMaterial) {
  const perfil = new Shape();
  perfil.moveTo(2.75, 0.18);
  perfil.lineTo(2.75, 0.26);
  perfil.lineTo(1.3, 0.4);
  perfil.lineTo(0.45, 0.52);
  perfil.lineTo(0.05, 0.52);
  perfil.lineTo(-0.35, 0.78);
  perfil.lineTo(-0.75, 0.95);
  perfil.lineTo(-1.1, 0.8);
  perfil.lineTo(-2.25, 0.46);
  perfil.lineTo(-2.45, 0.32);
  perfil.lineTo(-2.45, 0.16);
  perfil.lineTo(2.75, 0.18);

  const geometria = new ExtrudeGeometry(perfil, {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 1,
  });
  geometria.translate(0, 0, -0.31);

  return new Mesh(geometria, pintura);
}

function roda(x: number, z: number, aro: MeshStandardMaterial, composto: Composto | null) {
  const conjunto = new Group();
  const pneu = new Mesh(new CylinderGeometry(0.36, 0.36, 0.4, 18), material(BORRACHA, 0.9));
  const centro = new Mesh(new CylinderGeometry(0.21, 0.21, 0.42, 12), aro);
  pneu.rotation.x = Math.PI / 2;
  centro.rotation.x = Math.PI / 2;
  conjunto.add(pneu, centro);

  if (composto) {
    const faixa = new Mesh(
      new TorusGeometry(0.29, 0.022, 4, 24),
      material(COR_DO_COMPOSTO[composto], 0.6),
    );
    faixa.position.z = Math.sign(z) * 0.205;
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

function asaDianteira(variacao: VariacaoDeAsa, detalhe: MeshStandardMaterial) {
  const conjunto = new Group();
  const elementos = { padrao: 1, carga: 2, arrasto: 1, evolucao: 3 }[variacao];
  const espessura = variacao === 'arrasto' ? 0.025 : 0.04;

  for (let indice = 0; indice < elementos; indice++) {
    const elemento = caixa(0.55 - indice * 0.13, espessura, 2 - indice * 0.06, detalhe);
    elemento.position.set(2.6 - indice * 0.12, 0.12 + indice * 0.06, 0);
    elemento.rotation.z = indice * 0.16;
    conjunto.add(elemento);
  }

  return conjunto;
}

function assoalho(
  variacao: VariacaoDeAssoalho,
  carbono: MeshStandardMaterial,
  detalhe: MeshStandardMaterial,
) {
  const conjunto = new Group();
  const base = caixa(4.6, 0.05, variacao === 'borda' ? 1.62 : 1.5, carbono);
  base.position.set(0, 0.12, 0);
  conjunto.add(base);

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
  const pintura = material(cor, 0.4);
  const detalhe = material(corSecundaria, 0.45);
  const carbono = material(CARBONO, 0.7);
  const conjunto = new Group();
  const patrocinio = visual.patrocinio
    ? new MeshBasicMaterial({
        map: texturaDoPatrocinio(visual.patrocinio, corSecundaria, corDoTexto(corSecundaria)),
      })
    : null;

  conjunto.add(monocoque(pintura));
  conjunto.add(assoalho(visual.assoalho, carbono, detalhe));

  for (const lado of [-1, 1]) {
    const sidepod = caixa(1.9, 0.34, 0.42, pintura);
    sidepod.position.set(-0.45, 0.36, lado * 0.58);
    conjunto.add(sidepod);

    const entrada = caixa(0.08, 0.26, 0.34, carbono);
    entrada.position.set(0.52, 0.38, lado * 0.58);
    conjunto.add(entrada);

    const placaDianteira = caixa(0.6, 0.22, 0.04, detalhe);
    placaDianteira.position.set(2.62, 0.2, lado * 0.98);
    conjunto.add(placaDianteira);

    const placaTraseira = caixa(0.62, 0.68, 0.04, pintura);
    placaTraseira.position.set(-2.4, 0.74, lado * 0.8);
    conjunto.add(placaTraseira);

    if (numero !== undefined) {
      const numeroNaLateral = new Mesh(
        new PlaneGeometry(0.5, 0.5),
        new MeshBasicMaterial({ map: texturaDoNumero(numero, corSecundaria), transparent: true }),
      );
      numeroNaLateral.position.set(-1.25, 0.62, lado * 0.37);
      numeroNaLateral.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(numeroNaLateral);
    }

    if (patrocinio) {
      const naLateral = new Mesh(new PlaneGeometry(1.2, 0.3), patrocinio);
      naLateral.position.set(-0.5, 0.37, lado * 0.792);
      naLateral.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(naLateral);

      const naPlaca = new Mesh(new PlaneGeometry(0.56, 0.14), patrocinio);
      naPlaca.position.set(-2.4, 0.86, lado * 0.822);
      naPlaca.rotation.y = lado === 1 ? 0 : Math.PI;
      conjunto.add(naPlaca);
    }
  }

  conjunto.add(asaDianteira(visual.asaDianteira, detalhe));

  const asa = ASA_TRASEIRA[visual.asaTraseira];
  const planoTraseiro = caixa(asa.plano, 0.05, 1.56, pintura);
  planoTraseiro.position.set(-2.38, 0.82, 0);
  conjunto.add(planoTraseiro);

  if (visual.asaTraseira === 'evolucao') {
    const planoInferior = caixa(0.32, 0.04, 1.2, carbono);
    planoInferior.position.set(-2.32, 0.42, 0);
    conjunto.add(planoInferior);
  }

  const flap = caixa(asa.flap, 0.04, 1.56, detalhe);
  flap.position.set(-asa.flap / 2, 0, 0);
  const dobradica = new Group();
  dobradica.position.set(-2.18, 0.9, 0);
  dobradica.rotation.z = FLAP_FECHADO;
  dobradica.add(flap);
  conjunto.add(dobradica);

  const suporte = caixa(0.08, 0.4, 0.06, carbono);
  suporte.position.set(-2.3, 0.6, 0);
  conjunto.add(suporte);

  const halo = new Mesh(new TorusGeometry(0.34, 0.035, 6, 20, Math.PI), carbono);
  halo.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  halo.position.set(0.05, 0.74, 0);
  conjunto.add(halo);

  const pilar = caixa(0.05, 0.22, 0.05, carbono);
  pilar.position.set(0.38, 0.64, 0);
  conjunto.add(pilar);

  const capacete = new Mesh(new SphereGeometry(0.16, 14, 10), detalhe);
  capacete.position.set(-0.08, 0.66, 0);
  conjunto.add(capacete);

  const viseira = new Mesh(
    new SphereGeometry(0.165, 14, 10, -Math.PI / 4, Math.PI / 2, Math.PI / 2.6, Math.PI / 5),
    material('#0b0b0f', 0.2),
  );
  viseira.position.copy(capacete.position);
  conjunto.add(viseira);

  const aro = material(corSecundaria, 0.35);
  for (const [x, z] of [
    [1.85, 0.86],
    [1.85, -0.86],
    [-1.65, 0.86],
    [-1.65, -0.86],
  ] as const) {
    conjunto.add(roda(x, z, aro, visual.pneus));
  }

  return { conjunto, dobradica };
}

function chao() {
  const conjunto = new Group();
  const base = new Mesh(
    new CircleGeometry(4.2, 48),
    new MeshStandardMaterial({ color: '#111114', roughness: 0.95 }),
  );
  base.rotation.x = -Math.PI / 2;

  const borda = new Mesh(
    new RingGeometry(4.15, 4.22, 64),
    new MeshBasicMaterial({ color: '#ff2a14', side: DoubleSide, transparent: true, opacity: 0.6 }),
  );
  borda.rotation.x = -Math.PI / 2;
  borda.position.y = 0.005;

  conjunto.add(base, borda);

  return conjunto;
}

function liberar(raiz: Object3D) {
  raiz.traverse((objeto) => {
    if (objeto instanceof Mesh) {
      objeto.geometry.dispose();
      const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material];

      for (const usado of materiais) {
        if ('map' in usado && usado.map) {
          usado.map.dispose();
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
  recipiente.append(renderizador.domElement);

  const cena = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(6.4, 3.2, 6.4);

  cena.add(new HemisphereLight(new Color('#ffffff'), new Color('#20202a'), 1.4));
  cena.add(new AmbientLight('#ffffff', 0.35));
  const sol = new DirectionalLight('#ffffff', 2.2);
  sol.position.set(5, 8, 4);
  cena.add(sol);

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
      renderizador.dispose();
      renderizador.domElement.remove();
    },
  };
}
