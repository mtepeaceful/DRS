DELETE FROM "campeoes";--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "piloto" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "pais" char(2);--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "equipe" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "pontos" real NOT NULL;--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "vitorias" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "construtor" varchar(100);--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "construtor_pontos" real;--> statement-breakpoint
ALTER TABLE "campeoes" ADD COLUMN "construtor_vitorias" smallint;