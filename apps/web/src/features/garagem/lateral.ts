import type { BufferGeometry } from 'three';
import { CanvasTexture, Float32BufferAttribute, SRGBColorSpace, Vector3 } from 'three';

/*
 * A pintura das laterais do carro 3D vem do desenho 2D dos cartões das
 * equipes. O desenho tem viewBox 0 0 1000 300, chão em y = 280 e eixos em
 * x = 182 (traseiro) e x = 819 (dianteiro). No 3D, o bico aponta para +x, o
 * eixo traseiro fica em x = -1,65 e o dianteiro em x = 1,85. Com isso dá para
 * levar cada ponto da carroceria 3D para o ponto do desenho que fica ao lado
 * dele, como se o desenho fosse projetado de lado no carro.
 */

const EIXO_TRASEIRO_2D = 182;
const EIXO_DIANTEIRO_2D = 819;
const CHAO_2D = 280;
const EIXO_TRASEIRO_3D = -1.65;
const EIXO_DIANTEIRO_3D = 1.85;
const ESCALA = (EIXO_DIANTEIRO_2D - EIXO_TRASEIRO_2D) / (EIXO_DIANTEIRO_3D - EIXO_TRASEIRO_3D);

/** Um ponto 3D que cai no canto do desenho, onde só há a cor de base. */
const COR_DE_BASE_3D = { x: EIXO_TRASEIRO_3D - 150 / ESCALA, y: 250 / ESCALA };

/** Abaixo disso, a face olha mais para fora do lado do que para o lado. */
const FACE_DE_LADO = 0.3;

const LARGURA = 2048;
const ALTURA_DO_LADO = Math.round((LARGURA * 300) / 1000);

/** Um retângulo do desenho 2D, em unidades do viewBox. */
export interface Caixa2D {
  esquerda: number;
  direita: number;
  topo: number;
  base: number;
  /**
   * Onde a peça 3D começa a receber o desenho, no eixo do carro. Atrás dele
   * a peça afina e se esconde embaixo da tampa do motor; sem esse corte, os
   * patrocínios do fim do sidepod caíam ali e quase sumiam.
   */
  inicio3D?: number;
  /**
   * Fração de baixo da peça 3D que fica sem desenho. Ali a peça faz a curva
   * para dentro (o rebaixo do sidepod) e os patrocínios ficavam escondidos.
   */
  rebaixo3D?: number;
}

type Para2D = (x: number, y: number) => [number, number];

/** Leva um ponto do carro 3D para o ponto do desenho que fica ao lado dele. */
const deLado: Para2D = (x, y) => [
  EIXO_TRASEIRO_2D + (x - EIXO_TRASEIRO_3D) * ESCALA,
  CHAO_2D - y * ESCALA,
];

/**
 * Estica a caixa de uma peça 3D até a caixa da mesma peça no desenho. Assim a
 * pintura do sidepod cai inteira no sidepod, mesmo que as proporções do 3D
 * e do 2D não sejam iguais.
 */
function encaixar(geometria: BufferGeometry, caixa: Caixa2D): Para2D {
  geometria.computeBoundingBox();
  const limites = geometria.boundingBox;

  if (!limites) {
    return deLado;
  }

  const { min, max } = limites;
  const inicio = Math.max(min.x, caixa.inicio3D ?? min.x);
  const largura = max.x - inicio || 1;
  const chao = min.y + (max.y - min.y) * (caixa.rebaixo3D ?? 0);
  const altura = max.y - chao || 1;

  return (x, y) => [
    caixa.esquerda + Math.max(0, (x - inicio) / largura) * (caixa.direita - caixa.esquerda),
    caixa.base - Math.max(0, (y - chao) / altura) * (caixa.base - caixa.topo),
  ];
}

/** Coordenadas de textura de um ponto: o lado direito (z > 0) fica na metade de cima. */
function coordenada(para2D: Para2D, x: number, y: number, direita: boolean): [number, number] {
  const [x2D, y2D] = para2D(x, y);
  const horizontal = x2D / 1000;
  const vertical = 1 - y2D / 300;
  const u = direita ? horizontal : 1 - horizontal;

  return [u, direita ? 0.5 + vertical / 2 : vertical / 2];
}

/**
 * Projeta o desenho de lado numa peça da carroceria. Cada triângulo pega o
 * lado do carro para onde ele olha, então a geometria vira não indexada para
 * que os vértices do meio do carro não misturem os dois lados.
 */
export function projetarDeLado(geometria: BufferGeometry, caixa?: Caixa2D) {
  const para2D = caixa ? encaixar(geometria, caixa) : deLado;
  const solta = geometria.index ? geometria.toNonIndexed() : geometria;
  const posicoes = solta.getAttribute('position');
  const normais = solta.getAttribute('normal');
  const uvs: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const normal = new Vector3();
  const auxiliar = new Vector3();

  for (let i = 0; i < posicoes.count; i += 3) {
    a.fromBufferAttribute(posicoes, i);
    b.fromBufferAttribute(posicoes, i + 1);
    c.fromBufferAttribute(posicoes, i + 2);
    if (normais) {
      normal.fromBufferAttribute(normais, i);
      normal.add(auxiliar.fromBufferAttribute(normais, i + 1));
      normal.add(auxiliar.fromBufferAttribute(normais, i + 2)).normalize();
    } else {
      normal.subVectors(b, a).cross(auxiliar.subVectors(c, a)).normalize();
    }

    const centroZ = (a.z + b.z + c.z) / 3;
    const direita = Math.abs(normal.z) > 0.2 ? normal.z > 0 : centroZ >= 0;

    // O desenho é de lado. Uma face que olha para a frente, para trás, para
    // cima ou para baixo receberia o desenho esticado, em faixas borradas.
    // Ela pega a cor de base, que ocupa o canto do desenho, longe da
    // carroceria. Numa peça encaixada (o sidepod), a face de cima também.
    const deCima = Math.abs(normal.z) < FACE_DE_LADO || (caixa !== undefined && normal.y > 0.75);

    for (const ponto of [a, b, c]) {
      uvs.push(
        ...(deCima
          ? coordenada(deLado, COR_DE_BASE_3D.x, COR_DE_BASE_3D.y, direita)
          : coordenada(para2D, ponto.x, ponto.y, direita)),
      );
    }
  }

  solta.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  if (solta !== geometria) {
    geometria.dispose();
  }

  return solta;
}

function carregarImagem(svg: string, caixa: string, largura: number, altura: number) {
  const completo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${caixa}" width="${largura}" height="${altura}">${svg}</svg>`;

  // Endereço data: e não blob: porque a política de segurança do site (CSP em
  // render.yaml) só aceita imagens de 'self' e data:. Com blob: a pintura não
  // carregava no site no ar.
  return new Promise<HTMLImageElement>((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error('Não deu para desenhar a pintura do carro.'));
    imagem.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(completo)}`;
  });
}

const prontas = new Map<string, HTMLCanvasElement>();
const pendentes = new Map<string, Promise<HTMLCanvasElement>>();

async function desenharLados(direita: string, esquerda: string) {
  const [imagemDireita, imagemEsquerda] = await Promise.all([
    carregarImagem(direita, '0 0 1000 300', LARGURA, ALTURA_DO_LADO),
    carregarImagem(esquerda, '0 0 1000 300', LARGURA, ALTURA_DO_LADO),
  ]);
  const tela = document.createElement('canvas');
  tela.width = LARGURA;
  tela.height = ALTURA_DO_LADO * 2;
  const contexto = tela.getContext('2d');
  contexto?.drawImage(imagemDireita, 0, 0, LARGURA, ALTURA_DO_LADO);
  contexto?.drawImage(imagemEsquerda, 0, ALTURA_DO_LADO, LARGURA, ALTURA_DO_LADO);

  return tela;
}

async function desenharQuadrado(svg: string, caixa: string) {
  const lado = 512;
  const imagem = await carregarImagem(svg, caixa, lado, lado);
  const tela = document.createElement('canvas');
  tela.width = lado;
  tela.height = lado;
  tela.getContext('2d')?.drawImage(imagem, 0, 0, lado, lado);

  return tela;
}

function textura(tela: HTMLCanvasElement) {
  const nova = new CanvasTexture(tela);
  nova.colorSpace = SRGBColorSpace;
  nova.anisotropy = 8;

  return nova;
}

/**
 * Desenha uma vez e guarda. A montagem refaz o carro a cada troca de peça;
 * com a tela guardada, a textura chega na hora, sem piscar.
 */
function guardada(
  chave: string,
  desenhar: () => Promise<HTMLCanvasElement>,
  aoFicarPronta: (textura: CanvasTexture) => void,
) {
  const pronta = prontas.get(chave);

  if (pronta) {
    aoFicarPronta(textura(pronta));
    return;
  }

  let pendente = pendentes.get(chave);

  if (!pendente) {
    pendente = desenhar().then((tela) => {
      prontas.set(chave, tela);
      pendentes.delete(chave);
      return tela;
    });
    pendentes.set(chave, pendente);
  }

  pendente.then((tela) => aoFicarPronta(textura(tela))).catch(() => undefined);
}

/** A textura das duas laterais: o lado direito em cima, o esquerdo embaixo. */
export function texturaLateral(
  direita: string,
  esquerda: string,
  aoFicarPronta: (textura: CanvasTexture) => void,
) {
  guardada(`lados:${direita}${esquerda}`, () => desenharLados(direita, esquerda), aoFicarPronta);
}

/** A textura de um desenho quadrado, como a roda vista de lado. */
export function texturaQuadrada(
  svg: string,
  caixa: string,
  aoFicarPronta: (textura: CanvasTexture) => void,
) {
  guardada(`quadrado:${caixa}${svg}`, () => desenharQuadrado(svg, caixa), aoFicarPronta);
}
