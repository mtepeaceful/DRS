import type { FonteDaHistoria } from '../ports/fonte-da-historia.js';
import type { GaleriaDeFotos } from '../ports/fonte-das-equipes.js';
import type { PilotoRepository } from '../ports/piloto-repository.js';
import { nomeComparavel } from './nome-comparavel.js';

export class PreencherFotosDosPilotos {
  constructor(
    private readonly pilotos: PilotoRepository,
    private readonly fonte: FonteDaHistoria,
    private readonly galeria: GaleriaDeFotos,
  ) {}

  async executar() {
    const semFoto = await this.pilotos.listarSemFoto();

    if (semFoto.length === 0) {
      return { guardadas: 0, semFoto: 0 };
    }

    const artigos = new Map(
      (await this.fonte.listarPilotos()).flatMap((piloto) =>
        piloto.wikipedia ? [[nomeComparavel(piloto.nome), piloto.wikipedia] as const] : [],
      ),
    );
    let guardadas = 0;

    for (const piloto of semFoto) {
      const artigo = artigos.get(nomeComparavel(piloto.nome));
      const foto = artigo ? await this.galeria.foto(artigo).catch(() => null) : null;

      if (foto?.licenca) {
        await this.pilotos.guardarFoto(piloto.id, foto);
        guardadas += 1;
      }
    }

    return { guardadas, semFoto: semFoto.length - guardadas };
  }
}
