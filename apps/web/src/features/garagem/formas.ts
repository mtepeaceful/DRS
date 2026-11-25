import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Quaternion,
  Shape,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';

export interface Secao {
  x: number;
  largura: number;
  base: number;
  topo: number;
  centroZ?: number;
}

const VOLTAS = 40;
const PASSOS_POR_TRECHO = 6;

function catmullRom(a: number, b: number, c: number, d: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3)
  );
}

function suavizar(secoes: readonly Secao[]) {
  const chaves = ['x', 'largura', 'base', 'topo', 'centroZ'] as const;
  const valor = (indice: number, chave: (typeof chaves)[number]) => {
    const secao = secoes[Math.max(0, Math.min(secoes.length - 1, indice))];

    return secao?.[chave] ?? 0;
  };
  const resultado: Secao[] = [];

  for (let indice = 0; indice < secoes.length - 1; indice++) {
    for (let passo = 0; passo < PASSOS_POR_TRECHO; passo++) {
      const t = passo / PASSOS_POR_TRECHO;
      const [x, largura, base, topo, centroZ] = chaves.map((chave) =>
        catmullRom(
          valor(indice - 1, chave),
          valor(indice, chave),
          valor(indice + 1, chave),
          valor(indice + 2, chave),
          t,
        ),
      ) as [number, number, number, number, number];
      resultado.push({ x, largura, base, topo, centroZ });
    }
  }

  const ultima = secoes.at(-1);

  if (ultima) {
    resultado.push(ultima);
  }

  return resultado;
}

// Corpo liso a partir de cortes transversais ao longo do carro. Cada corte é
// uma superelipse (entre elipse e retângulo de cantos redondos), e os cortes
// são interpolados para a superfície não ter quinas.
export function corpoPorSecoes(secoes: readonly Secao[], quadratura = 2.6) {
  const cortes = suavizar(secoes);
  const posicoes: number[] = [];
  const indices: number[] = [];
  const expoente = 2 / quadratura;

  for (const { x, largura, base, topo, centroZ = 0 } of cortes) {
    const meiaAltura = (topo - base) / 2;
    const centroY = base + meiaAltura;

    for (let volta = 0; volta < VOLTAS; volta++) {
      const angulo = (volta / VOLTAS) * Math.PI * 2;
      const cosseno = Math.cos(angulo);
      const seno = Math.sin(angulo);
      posicoes.push(
        x,
        centroY + meiaAltura * Math.sign(seno) * Math.abs(seno) ** expoente,
        centroZ + largura * Math.sign(cosseno) * Math.abs(cosseno) ** expoente,
      );
    }
  }

  for (let corte = 0; corte < cortes.length - 1; corte++) {
    for (let volta = 0; volta < VOLTAS; volta++) {
      const a = corte * VOLTAS + volta;
      const b = corte * VOLTAS + ((volta + 1) % VOLTAS);
      const c = a + VOLTAS;
      const d = b + VOLTAS;
      indices.push(a, c, b, b, c, d);
    }
  }

  for (const [corte, frente] of [
    [0, true],
    [cortes.length - 1, false],
  ] as const) {
    const secao = cortes[corte];

    if (!secao) {
      continue;
    }

    const { x, base, topo, centroZ = 0 } = secao;
    const centro = posicoes.length / 3;
    posicoes.push(x, (base + topo) / 2, centroZ);

    for (let volta = 0; volta < VOLTAS; volta++) {
      const a = corte * VOLTAS + volta;
      const b = corte * VOLTAS + ((volta + 1) % VOLTAS);
      indices.push(...(frente ? [centro, b, a] : [centro, a, b]));
    }
  }

  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new Float32BufferAttribute(posicoes, 3));
  geometria.setIndex(indices);
  geometria.computeVertexNormals();

  return geometria;
}

// Perfil de asa (bordo de ataque arredondado, bordo de fuga fino) com o bordo
// de ataque em x = 0 e a corda indo para trás, estendido no eixo z.
export function perfilDeAsa(corda: number, envergadura: number, espessura = 0.12) {
  const perfil = new Shape();
  const pontos = 14;
  const superior: Vector2[] = [];
  const inferior: Vector2[] = [];

  for (let indice = 0; indice <= pontos; indice++) {
    const t = (1 - Math.cos((indice / pontos) * Math.PI)) / 2;
    const meia =
      5 *
      espessura *
      (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t ** 2 + 0.2843 * t ** 3 - 0.1036 * t ** 4);
    const arqueamento = 0.06 * Math.sin(Math.PI * t) * corda;
    superior.push(new Vector2(-t * corda, arqueamento + meia * corda));
    inferior.push(new Vector2(-t * corda, arqueamento - meia * corda * 0.6));
  }

  perfil.setFromPoints([...superior, ...inferior.reverse()]);
  const geometria = new ExtrudeGeometry(perfil, {
    depth: envergadura,
    bevelEnabled: false,
    curveSegments: 2,
  });
  geometria.translate(0, 0, -envergadura / 2);
  geometria.computeVertexNormals();

  return geometria;
}

// Placa fina recortada num contorno (x, y), com espessura no eixo z.
export function placa(contorno: readonly (readonly [number, number])[], espessura: number) {
  const forma = new Shape(contorno.map(([x, y]) => new Vector2(x, y)));
  const geometria = new ExtrudeGeometry(forma, {
    depth: espessura,
    bevelEnabled: true,
    bevelThickness: espessura * 0.3,
    bevelSize: espessura * 0.3,
    bevelSegments: 2,
  });
  geometria.translate(0, 0, -espessura / 2);

  return geometria;
}

export function tubo(pontos: readonly (readonly [number, number, number])[], raio: number) {
  const curva = new CatmullRomCurve3(pontos.map(([x, y, z]) => new Vector3(x, y, z)));

  return new TubeGeometry(curva, 48, raio, 12, false);
}

// Haste fina entre dois pontos, como os braços da suspensão.
export function haste(
  de: readonly [number, number, number],
  ate: readonly [number, number, number],
  raio = 0.014,
) {
  const inicio = new Vector3(...de);
  const fim = new Vector3(...ate);
  const direcao = fim.clone().sub(inicio);
  const geometria = new CylinderGeometry(raio, raio, direcao.length(), 8);
  geometria.applyQuaternion(
    new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direcao.normalize()),
  );
  const meio = inicio.add(fim).multiplyScalar(0.5);
  geometria.translate(meio.x, meio.y, meio.z);

  return geometria;
}

// Pneu com flanco arredondado, girado para rodar em torno do eixo z.
export function pneu(raio: number, largura: number, raioDoAro: number) {
  const meia = largura / 2;
  const curva = meia * 0.45;
  const pontos: Vector2[] = [new Vector2(raioDoAro, -meia * 0.9)];

  for (const [centroY, inicio] of [
    [-meia + curva, -Math.PI / 2],
    [meia - curva, 0],
  ] as const) {
    for (let indice = 0; indice <= 6; indice++) {
      const angulo = inicio + (indice / 6) * (Math.PI / 2);
      pontos.push(
        new Vector2(raio - curva + Math.cos(angulo) * curva, centroY + Math.sin(angulo) * curva),
      );
    }
  }

  pontos.push(new Vector2(raioDoAro, meia * 0.9));
  const geometria = new LatheGeometry(pontos, 64);
  geometria.rotateX(Math.PI / 2);

  return geometria;
}
