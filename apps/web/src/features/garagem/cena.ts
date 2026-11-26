import {
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Efeitos } from './efeitos';
import { aparelhoForte, desenhoPorSoftware } from './suporte';
import { carregarModelo, carroDoModelo, modeloPronto } from './modelo';
import type { ModeloDoSite } from './modelos';
import { idiomaAtual } from '../../shared/i18n/idioma';

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
  /** O carro baixado do Sketchfab (ou pintado pelo site) que vai para o palco. */
  modelo: ModeloDoSite;
  visual?: Partial<Visual> | undefined;
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
  /** Verdadeiro enquanto o carro ainda não chegou (o palco fica vazio). */
  carregando: () => boolean;
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

/**
 * O carro baixado com as peças da montagem. Enquanto o modelo não chega, o
 * conjunto fica vazio: o palco mostra o aviso de carregamento.
 */
function carro({ visual: pedido, modelo }: Pintura) {
  const visual = { ...VISUAL_PADRAO, ...pedido };
  const baixado = modeloPronto(modelo);

  if (!baixado) {
    return { conjunto: new Group(), dobradica: new Group() };
  }

  return carroDoModelo(
    baixado,
    {
      asaDianteira: visual.asaDianteira,
      asaTraseira: visual.asaTraseira,
      corDoComposto: visual.pneus ? COR_DO_COMPOSTO[visual.pneus] : null,
    },
    FLAP_FECHADO,
  );
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
    // As peças do modelo baixado são da cópia carregada uma vez só.
    if (objeto instanceof Mesh && !objeto.userData.compartilhado) {
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

  let atual = carro(pintura);
  let pinturaAtual = pintura;
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

  function pintar(nova: Pintura) {
    pinturaAtual = nova;
    const angulo = atual.dobradica.rotation.z;
    cena.remove(atual.conjunto);
    paraLiberar.push(atual.conjunto);
    atual = carro(nova);
    atual.dobradica.rotation.z = angulo;
    cena.add(atual.conjunto);
    refazerSombra();
    baixarModelo(nova.modelo);
  }

  // O modelo chega depois. Até lá o palco mostra um aviso de carregamento,
  // também na troca de equipe. Se o download falhar, o aviso vira um botão
  // para tentar de novo.
  const aviso = avisoDeCarregamento(recipiente, () => baixarModelo(pinturaAtual.modelo));
  let esperando = false;

  function esperar(estado: 'pronto' | 'carregando' | 'falhou') {
    esperando = estado !== 'pronto';
    atual.conjunto.visible = !esperando;
    aviso.mostrar(estado);
    pedirQuadro();
  }

  function baixarModelo(modelo: ModeloDoSite) {
    if (modeloPronto(modelo)) {
      esperar('pronto');
      return;
    }
    esperar('carregando');
    carregarModelo(modelo).then(
      () => {
        if (!destruida && pinturaAtual.modelo === modelo) {
          pintar(pinturaAtual);
        }
      },
      () => {
        if (!destruida && pinturaAtual.modelo === modelo) {
          esperar('falhou');
        }
      },
    );
  }

  baixarModelo(pintura.modelo);

  return {
    leve,
    pintar,
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
    carregando: () => esperando,
    destruir: () => {
      destruida = true;
      aviso.remover();
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

/** O aviso de "carregando" no meio do palco, montado sem CSS de fora. */
function avisoDeCarregamento(recipiente: HTMLElement, tentarDeNovo: () => void) {
  if (getComputedStyle(recipiente).position === 'static') {
    recipiente.style.position = 'relative';
  }

  const ingles = idiomaAtual() === 'en';
  const aviso = document.createElement('div');
  aviso.setAttribute('role', 'status');
  Object.assign(aviso.style, {
    position: 'absolute',
    inset: '0',
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#a5a7b0',
    fontSize: '0.9rem',
    fontWeight: '600',
    textAlign: 'center',
    pointerEvents: 'none',
  });

  const roda = document.createElement('span');
  Object.assign(roda.style, {
    width: '34px',
    height: '34px',
    border: '3px solid rgb(255 255 255 / 0.14)',
    borderTopColor: '#e10600',
    borderRadius: '50%',
  });
  const texto = document.createElement('span');
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = ingles ? 'Try again' : 'Tentar de novo';
  Object.assign(botao.style, {
    pointerEvents: 'auto',
    padding: '8px 16px',
    border: '1px solid rgb(255 255 255 / 0.25)',
    borderRadius: '999px',
    background: 'transparent',
    color: '#f4f4f5',
    font: 'inherit',
    cursor: 'pointer',
  });
  botao.addEventListener('click', tentarDeNovo);
  aviso.append(roda, texto, botao);
  recipiente.append(aviso);

  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let giro: Animation | null = null;

  return {
    mostrar(estado: 'pronto' | 'carregando' | 'falhou') {
      const carregando = estado === 'carregando';
      aviso.style.display = estado === 'pronto' ? 'none' : 'flex';
      roda.style.display = carregando ? '' : 'none';
      botao.style.display = estado === 'falhou' ? '' : 'none';
      texto.textContent = carregando
        ? ingles
          ? 'Loading the car…'
          : 'Carregando o carro…'
        : ingles
          ? 'Could not load the car.'
          : 'Não deu para carregar o carro.';
      if (carregando && !giro && !semMovimento) {
        giro = roda.animate([{ transform: 'rotate(0turn)' }, { transform: 'rotate(1turn)' }], {
          duration: 900,
          iterations: Infinity,
        });
      } else if (!carregando) {
        giro?.cancel();
        giro = null;
      }
    },
    remover() {
      giro?.cancel();
      botao.removeEventListener('click', tentarDeNovo);
      aviso.remove();
    },
  };
}
