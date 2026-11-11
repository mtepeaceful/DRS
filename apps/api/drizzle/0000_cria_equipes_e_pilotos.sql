CREATE TABLE "equipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"numero" smallint NOT NULL,
	"nacionalidade" varchar(100) NOT NULL,
	"titulos" smallint DEFAULT 0 NOT NULL,
	"equipe_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pilotos_numero_unico" UNIQUE("numero"),
	CONSTRAINT "pilotos_numero_valido" CHECK ("pilotos"."numero" between 0 and 99),
	CONSTRAINT "pilotos_titulos_validos" CHECK ("pilotos"."titulos" >= 0)
);
--> statement-breakpoint
ALTER TABLE "pilotos" ADD CONSTRAINT "pilotos_equipe_id_equipes_id_fk" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "equipes_nome_unico" ON "equipes" USING btree (lower("nome"));--> statement-breakpoint
CREATE INDEX "pilotos_equipe_id_idx" ON "pilotos" USING btree ("equipe_id");