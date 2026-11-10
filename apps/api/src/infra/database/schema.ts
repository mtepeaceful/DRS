import { sql } from 'drizzle-orm';
import {
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
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [uniqueIndex('equipes_nome_unico').on(sql`lower(${tabela.nome})`)],
);

export const pilotos = pgTable(
  'pilotos',
  {
    id: uuid().primaryKey().defaultRandom(),
    nome: varchar({ length: 255 }).notNull(),
    numero: smallint().notNull().unique('pilotos_numero_unico'),
    nacionalidade: varchar({ length: 100 }).notNull(),
    titulos: smallint().notNull().default(0),
    equipeId: uuid('equipe_id')
      .notNull()
      .references(() => equipes.id, { onDelete: 'restrict' }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check('pilotos_numero_valido', sql`${tabela.numero} between 0 and 99`),
    check('pilotos_titulos_validos', sql`${tabela.titulos} >= 0`),
    index('pilotos_equipe_id_idx').on(tabela.equipeId),
  ],
);
