ALTER TABLE "equipes" ALTER COLUMN "cor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "equipes" ALTER COLUMN "cor_secundaria" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pilotos" ALTER COLUMN "pais" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pilotos" DROP COLUMN "nacionalidade";--> statement-breakpoint
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_cor_valida" CHECK ("equipes"."cor" ~ '^#[0-9a-f]{6}$');--> statement-breakpoint
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_cor_secundaria_valida" CHECK ("equipes"."cor_secundaria" ~ '^#[0-9a-f]{6}$');--> statement-breakpoint
ALTER TABLE "pilotos" ADD CONSTRAINT "pilotos_pais_valido" CHECK ("pilotos"."pais" ~ '^[A-Z]{2}$');