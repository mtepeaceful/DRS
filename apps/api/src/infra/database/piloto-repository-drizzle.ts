import { asc, count, eq, ilike, or, sql } from 'drizzle-orm';
import type {
  FiltroDePilotos,
  PilotoRepository,
} from '../../application/ports/piloto-repository.js';
import { EquipeInvalida, NumeroJaEmUso } from '../../domain/erros.js';
import type { DadosPiloto, Piloto } from '../../domain/piloto.js';
import type { Database } from './client.js';
import { colunasDaEquipe } from './equipe-repository-drizzle.js';
import { violouChaveEstrangeira, violouUnicidade } from './erros-postgres.js';
import { equipes, pilotos } from './schema.js';

const colunas = {
  id: pilotos.id,
  nome: pilotos.nome,
  numero: pilotos.numero,
  pais: pilotos.pais,
  titulos: pilotos.titulos,
  criadoEm: pilotos.criadoEm,
  atualizadoEm: pilotos.atualizadoEm,
  equipe: colunasDaEquipe,
};

function escaparLike(termo: string) {
  return termo.replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
}

export class PilotoRepositoryDrizzle implements PilotoRepository {
  constructor(private readonly db: Database) {}

  async listar({ busca, pagina, porPagina }: FiltroDePilotos) {
    const padrao = busca && `%${escaparLike(busca)}%`;
    const filtro = padrao
      ? or(ilike(pilotos.nome, padrao), ilike(equipes.nome, padrao))
      : undefined;

    const [itens, [contagem]] = await Promise.all([
      this.consulta()
        .where(filtro)
        .orderBy(asc(pilotos.nome), asc(pilotos.id))
        .limit(porPagina)
        .offset((pagina - 1) * porPagina),
      this.db
        .select({ total: count() })
        .from(pilotos)
        .innerJoin(equipes, eq(pilotos.equipeId, equipes.id))
        .where(filtro),
    ]);

    return { itens, total: contagem?.total ?? 0 };
  }

  async buscarPorId(id: string): Promise<Piloto | null> {
    const [piloto] = await this.consulta().where(eq(pilotos.id, id));

    return piloto ?? null;
  }

  async buscarPorNumero(numero: number): Promise<Piloto | null> {
    const [piloto] = await this.consulta().where(eq(pilotos.numero, numero));

    return piloto ?? null;
  }

  async buscarPorNome(nome: string): Promise<Piloto | null> {
    const [piloto] = await this.consulta()
      .where(eq(sql`lower(${pilotos.nome})`, nome.toLowerCase()))
      .limit(1);

    return piloto ?? null;
  }

  async criar(dados: DadosPiloto): Promise<Piloto> {
    const [criado] = await this.gravar(dados, () =>
      this.db.insert(pilotos).values(dados).returning({ id: pilotos.id }),
    );

    return this.recarregar(criado?.id);
  }

  async atualizar(id: string, dados: DadosPiloto): Promise<Piloto | null> {
    const [atualizado] = await this.gravar(dados, () =>
      this.db
        .update(pilotos)
        .set({ ...dados, atualizadoEm: new Date() })
        .where(eq(pilotos.id, id))
        .returning({ id: pilotos.id }),
    );

    return atualizado ? this.recarregar(atualizado.id) : null;
  }

  async excluir(id: string): Promise<boolean> {
    const excluidos = await this.db
      .delete(pilotos)
      .where(eq(pilotos.id, id))
      .returning({ id: pilotos.id });

    return excluidos.length > 0;
  }

  private async gravar<Resultado>(dados: DadosPiloto, operacao: () => Promise<Resultado>) {
    try {
      return await operacao();
    } catch (erro) {
      if (violouUnicidade(erro, 'pilotos_numero_unico')) {
        throw new NumeroJaEmUso(dados.numero);
      }

      if (violouChaveEstrangeira(erro, 'pilotos_equipe_id_equipes_id_fk')) {
        throw new EquipeInvalida();
      }

      throw erro;
    }
  }

  private consulta() {
    return this.db
      .select(colunas)
      .from(pilotos)
      .innerJoin(equipes, eq(pilotos.equipeId, equipes.id))
      .$dynamic();
  }

  private async recarregar(id: string | undefined): Promise<Piloto> {
    const piloto = id ? await this.buscarPorId(id) : null;

    if (!piloto) {
      throw new Error('O banco não retornou o piloto gravado');
    }

    return piloto;
  }
}
