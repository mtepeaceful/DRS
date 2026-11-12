CREATE TABLE "campeoes" (
	"ano" smallint PRIMARY KEY NOT NULL,
	"sigla" char(3) NOT NULL,
	CONSTRAINT "campeoes_ano_valido" CHECK ("campeoes"."ano" between 1950 and 2100),
	CONSTRAINT "campeoes_sigla_valida" CHECK ("campeoes"."sigla" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "importacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"executada_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "importacoes_executada_em_idx" ON "importacoes" USING btree ("executada_em");