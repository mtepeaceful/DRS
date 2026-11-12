import type { FonteDaHistoria } from '../ports/fonte-da-historia.js';
import type { Enciclopedia, Foto } from '../ports/fonte-das-equipes.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';
import { nomeComparavel } from './nome-comparavel.js';

export interface FotoDoPiloto {
  id: string;
  foto: Foto;
}

const LIMITE_DO_GRID = 100;
const BUSCAS_SIMULTANEAS = 4;

export class FotosDosPilotos {
  constructor(
    private readonly pilotos: PilotoRepository,
    private readonly fonte: FonteDaHistoria,
    private readonly enciclopedia: Enciclopedia,
  ) {}

  async executar(): Promise<FotoDoPiloto[]> {
    const [{ itens }, naF1] = await Promise.all([
      this.pilotos.listar({ pagina: 1, porPagina: LIMITE_DO_GRID }),
      this.fonte.listarPilotos(),
    ]);
    const artigos = new Map(
      naF1.flatMap((piloto) =>
        piloto.wikipedia ? [[nomeComparavel(piloto.nome), piloto.wikipedia] as const] : [],
      ),
    );
    const pendentes = itens.flatMap((piloto) => {
      const artigo = artigos.get(nomeComparavel(piloto.nome));

      return artigo ? [{ id: piloto.id, artigo }] : [];
    });
    const fotos: FotoDoPiloto[] = [];

    for (let inicio = 0; inicio < pendentes.length; inicio += BUSCAS_SIMULTANEAS) {
      const lote = pendentes.slice(inicio, inicio + BUSCAS_SIMULTANEAS);
      const verbetes = await Promise.all(
        lote.map(({ artigo }) => this.enciclopedia.verbete(artigo).catch(() => null)),
      );

      lote.forEach(({ id }, indice) => {
        const foto = verbetes[indice]?.foto;

        if (foto) fotos.push({ id, foto });
      });
    }

    return fotos;
  }
}
