ALTER TABLE "equipes" ADD COLUMN "cor" varchar(7);--> statement-breakpoint
ALTER TABLE "equipes" ADD COLUMN "cor_secundaria" varchar(7);--> statement-breakpoint
ALTER TABLE "pilotos" ADD COLUMN "pais" char(2);--> statement-breakpoint
UPDATE "equipes" SET
	"cor" = CASE lower("nome")
		WHEN 'ferrari' THEN '#dc0000'
		WHEN 'mclaren' THEN '#ff8000'
		WHEN 'mercedes' THEN '#c8ccce'
		WHEN 'williams' THEN '#ffffff'
		WHEN 'red bull racing' THEN '#1e41ff'
		WHEN 'audi' THEN '#000000'
		ELSE '#8a8d96'
	END,
	"cor_secundaria" = CASE lower("nome")
		WHEN 'ferrari' THEN '#fff200'
		WHEN 'mclaren' THEN '#000000'
		WHEN 'mercedes' THEN '#00a19c'
		WHEN 'williams' THEN '#00a0de'
		WHEN 'red bull racing' THEN '#ffcc00'
		WHEN 'audi' THEN '#00c853'
		ELSE '#ffffff'
	END;--> statement-breakpoint
UPDATE "pilotos" SET "pais" = CASE lower("nacionalidade")
	WHEN 'brasileiro' THEN 'BR'
	WHEN 'britânico' THEN 'GB'
	WHEN 'francês' THEN 'FR'
	WHEN 'alemão' THEN 'DE'
	WHEN 'holandês' THEN 'NL'
	WHEN 'monegasco' THEN 'MC'
	WHEN 'italiano' THEN 'IT'
	WHEN 'espanhol' THEN 'ES'
	WHEN 'australiano' THEN 'AU'
	WHEN 'argentino' THEN 'AR'
	ELSE 'ZZ'
END;
