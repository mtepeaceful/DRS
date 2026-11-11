import type { Campeonato, FonteDoCampeonato } from '../ports/fonte-do-campeonato.js';
import type { FonteDeNoticias, Noticia } from '../ports/fonte-de-noticias.js';

export interface Painel {
  campeonato: Campeonato | null;
  noticias: Noticia[];
}

const LIMITE_DE_NOTICIAS = 8;

export class MontarPainel {
  constructor(
    private readonly campeonato: FonteDoCampeonato,
    private readonly noticias: FonteDeNoticias,
  ) {}

  async executar(agora: Date): Promise<Painel> {
    const [campeonato, noticias] = await Promise.allSettled([
      this.campeonato.buscarCampeonato(agora),
      this.noticias.buscarNoticias(),
    ]);

    return {
      campeonato: campeonato.status === 'fulfilled' ? campeonato.value : null,
      noticias:
        noticias.status === 'fulfilled'
          ? noticias.value
              .toSorted((a, b) => b.publicadaEm.getTime() - a.publicadaEm.getTime())
              .slice(0, LIMITE_DE_NOTICIAS)
          : [],
    };
  }
}
