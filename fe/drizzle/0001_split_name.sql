-- Split full name into first_name + last_name (idempotent for DBs that already migrated or were pushed from schema).
DO $$ BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'name'
	) THEN
		ALTER TABLE "leads" RENAME COLUMN "name" TO "first_name";
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'last_name'
	) THEN
		ALTER TABLE "leads" ADD COLUMN "last_name" varchar(255) NOT NULL DEFAULT '';
		ALTER TABLE "leads" ALTER COLUMN "last_name" DROP DEFAULT;
	END IF;
END $$;
