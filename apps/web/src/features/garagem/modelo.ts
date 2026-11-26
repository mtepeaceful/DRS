import { Group, Mesh, MeshStandardMaterial, type Object3D, TorusGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ModeloDoSite } from './modelos';

/**
 * Os carros 2026 baixados do Sketchfab (série de Dave Love, licença CC BY 4.0;
 * o crédito de cada um fica em public/modelos/<carro>/CREDITOS.txt). Cada
 * arquivo foi preparado antes de entrar no site: frente para +x, rodas no
 * mesmo lugar das do carro desenhado em código, peças separadas (asas, flap,
 * rodas, carroceria), malha simplificada e texturas em WebP. O eixo de cada
 * peça que se mexe vem nos extras do nó. Ficam como .gltf com arquivos à
 * parte, porque um .glb com texturas embutidas obriga o carregador a usar
 * endereços blob:, que a CSP do site bloqueia.
 */
const prontos = new Map<ModeloDoSite, Group>();
const pedidos = new Map<ModeloDoSite, Promise<Group>>();

/** Carrega o modelo uma vez só; as garagens usam cópias dele. */
export function carregarModelo(modelo: ModeloDoSite): Promise<Group> {
  const pedido =
    pedidos.get(modelo) ??
    new GLTFLoader().loadAsync(`/modelos/${modelo}/${modelo}.gltf`).then((gltf) => {
      const raiz = gltf.scene;
      raiz.updateMatrixWorld(true);

      // Cada peça que gira ganha um grupo no eixo dela, sem sair do lugar.
      const comEixo: { nome: string; peca: Object3D; eixo: [number, number, number] }[] = [];
      raiz.traverse((peca) => {
        const eixo = peca.userData.eixo as [number, number, number] | undefined;
        if (eixo) {
          comEixo.push({ nome: peca.name, peca, eixo });
        }
      });

      for (const { nome, peca, eixo } of comEixo) {
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
