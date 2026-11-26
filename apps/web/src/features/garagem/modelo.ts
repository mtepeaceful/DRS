import { Group, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * O RB22 2026 baixado do Sketchfab ("2026 Redbull RB22", de Dave Love,
 * licença CC BY 4.0). O arquivo foi preparado antes de entrar no site: frente
 * para +x, rodas no mesmo lugar das do carro desenhado em código, peças
 * separadas (asas, flap, rodas, carroceria), malha simplificada e texturas em
 * WebP. Fica em public/modelos/rb22 como .gltf com arquivos à parte, porque um
 * .glb com texturas embutidas obriga o carregador a usar endereços blob:, que
 * a CSP do site bloqueia.
 */
export type ModeloDoSite = 'rb22';

const ENDERECO: Record<ModeloDoSite, string> = {
  rb22: '/modelos/rb22/rb22.gltf',
};

/** Onde fica, no carro do site, o eixo de cada peça que se mexe. */
const ESCALA = 3.5 / 3.4;
const noSite = (x: number, y: number, z: number) =>
  [x * ESCALA + 0.1, y * ESCALA, z * ESCALA] as const;
const EIXOS: Record<string, readonly [number, number, number]> = {
  flap: noSite(-2.335, 0.945, 0),
  asaDianteira: noSite(2.5, 0.11, 0),
  rodaFE: noSite(1.7, 0.325, 0.775),
  rodaFD: noSite(1.7, 0.325, -0.775),
  rodaTE: noSite(-1.7, 0.325, 0.74),
  rodaTD: noSite(-1.7, 0.325, -0.74),
};

const prontos = new Map<ModeloDoSite, Group>();
const pedidos = new Map<ModeloDoSite, Promise<Group>>();

/** Carrega o modelo uma vez só; as garagens usam cópias dele. */
export function carregarModelo(modelo: ModeloDoSite): Promise<Group> {
  const pedido =
    pedidos.get(modelo) ??
    new GLTFLoader().loadAsync(ENDERECO[modelo]).then((gltf) => {
      const raiz = gltf.scene;
      raiz.updateMatrixWorld(true);

      // Cada peça que gira ganha um grupo no eixo dela, sem sair do lugar.
      for (const [nome, eixo] of Object.entries(EIXOS)) {
        const peca = raiz.getObjectByName(nome);

        if (!peca) {
          continue;
        }

        // O grupo fica direto na raiz, que já está nas medidas do site.
        const pivo = new Group();
        pivo.name = `${nome}-eixo`;
        pivo.position.set(...eixo);
        raiz.add(pivo);
        pivo.updateMatrixWorld(true);
        pivo.attach(peca);
      }

      raiz.traverse((objeto) => {
        if (objeto instanceof Mesh) {
          objeto.castShadow = true;
          objeto.receiveShadow = true;
          objeto.userData.compartilhado = true;
        }
      });

      prontos.set(modelo, raiz);
      return raiz;
    });

  pedidos.set(modelo, pedido);
  return pedido;
}

export function modeloPronto(modelo: ModeloDoSite) {
  return prontos.get(modelo) ?? null;
}

export interface CarroDoModelo {
  conjunto: Group;
  /** O flap da asa traseira: gira no mesmo ângulo do carro desenhado em código. */
  dobradica: Group;
}

export interface PecasDoModelo {
  asaDianteira: 'padrao' | 'carga' | 'arrasto' | 'evolucao';
  asaTraseira: 'padrao' | 'carga' | 'arrasto' | 'evolucao';
  corDoComposto: string | null;
}

/**
 * Uma cópia do modelo com as peças escolhidas na montagem. A malha e os
 * materiais são do modelo carregado (não são liberados com o carro).
 */
export function carroDoModelo(
  modelo: Group,
  pecas: PecasDoModelo,
  flapFechado: number,
): CarroDoModelo {
  const conjunto = new Group();
  const copia = modelo.clone(true);
  conjunto.add(copia);

  // Asas: mais carga deixa a asa dianteira mais alta e o flap traseiro mais
  // inclinado; menos arrasto, o contrário. A peça do modelo é a mesma.
  const alturaDaDianteira = { padrao: 1, carga: 1.3, arrasto: 0.75, evolucao: 1.12 };
  const anguloDoFlap = { padrao: 0, carga: -0.14, arrasto: 0.16, evolucao: -0.06 };
  const dianteira = copia.getObjectByName('asaDianteira-eixo');
  if (dianteira) {
    dianteira.scale.y = alturaDaDianteira[pecas.asaDianteira];
  }

  // O flap do modelo já vem fechado. A dobradiça recebe o ângulo do carro
  // desenhado e o grupo de dentro desconta o ângulo de fechado.
  const dobradica = new Group();
  const flap = copia.getObjectByName('flap-eixo');
  if (flap) {
    dobradica.position.copy(flap.position);
    const dentro = new Group();
    dentro.rotation.z = -flapFechado + anguloDoFlap[pecas.asaTraseira];
    flap.position.set(0, 0, 0);
    dentro.add(flap);
    dobradica.add(dentro);
    copia.add(dobradica);
  }

  // Pneus: a faixa do composto pintada no flanco de cada roda.
  if (pecas.corDoComposto) {
    const tinta = new MeshStandardMaterial({ color: pecas.corDoComposto, roughness: 0.6 });
    for (const nome of ['rodaFE', 'rodaFD', 'rodaTE', 'rodaTD']) {
      const roda = copia.getObjectByName(`${nome}-eixo`);
      if (!roda) {
        continue;
      }
      const lado = Math.sign(roda.position.z);
      const traseiraDaRoda = roda.position.x < 0;
      const faixa = new Mesh(new TorusGeometry(0.3, 0.009, 8, 64), tinta);
      faixa.position.z = lado * (traseiraDaRoda ? 0.205 : 0.18);
      roda.add(faixa);
    }
  }

  return { conjunto, dobradica };
}
