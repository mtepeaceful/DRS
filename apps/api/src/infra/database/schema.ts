import { sql } from 'drizzle-orm';
import {
  char,
  check,
  index,
  pgTable,
  smallint,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const equipes = pgTable(
  'equipes',
  {
    id: uuid().primaryKey().defaultRandom(),
    nome: varchar({ length: 100 }).notNull(),
    cor: varchar({ length: 7 }).notNull(),
    corSecundaria: varchar('cor_secundaria', { length: 7 }).notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    uniqueIndex('equipes_nome_unico').on(sql`lower(${tabela.nome})`),
    check('equipes_cor_valida', sql`${tabela.cor} ~ '^#[0-9a-f]{6}$'`),
    check('equipes_cor_secundaria_valida', sql`${tabela.corSecundaria} ~ '^#[0-9a-f]{6}$'`),
  ],
);

export const pilotos = pgTable(
  'pilotos',
  {
    id: uuid().primaryKey().defaultRandom(),
    nome: varchar({ length: 255 }).notNull(),
    numero: smallint().notNull().unique('pilotos_numero_unico'),
    pais: char({ length: 2 }).notNull(),
    titulos: smallint().notNull().default(0),
    equipeId: uuid('equipe_id')
      .notNull()
      .references(() => equipes.id, { onDelete: 'restrict' }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check('pilotos_numero_valido', sql`${tabela.numero} between 0 and 99`),
    check('pilotos_pais_valido', sql`${tabela.pais} ~ '^[A-Z]{2}$'`),
    check('pilotos_titulos_validos', sql`${tabela.titulos} >= 0`),
    index('pilotos_equipe_id_idx').on(tabela.equipeId),
  ],
);

export const campeoes = pgTable(
  'campeoes',
  {
    ano: smallint().primaryKey(),
    sigla: char({ length: 3 }),
  },
  (tabela) => [
    check('campeoes_ano_valido', sql`${tabela.ano} between 1950 and 2100`),
    check('campeoes_sigla_valida', sql`${tabela.sigla} ~ '^[A-Z]{3}$'`),
  ],
);

export const importacoes = pgTable(
  'importacoes',
  {
    id: uuid().primaryKey().defaultRandom(),
    executadaEm: timestamp('executada_em', { withTimezone: true }).notNull(),
  },
  (tabela) => [index('importacoes_executada_em_idx').on(tabela.executadaEm)],
);
