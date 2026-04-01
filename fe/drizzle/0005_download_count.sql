ALTER TABLE "leads"
ADD COLUMN IF NOT EXISTS "download_count" integer NOT NULL DEFAULT 0;
--> statement-breakpoint

DO $$
BEGIN
	-- Only run the backfill + drop logic if the legacy column still exists.
	-- This guarantees that re-running the migration will NOT touch
	-- existing download_count values once email_verified_at is gone.
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'leads'
		  AND column_name = 'email_verified_at'
	) THEN
		-- Seed initial download_count based on email verification state.
		-- Verified emails (email_verified_at IS NOT NULL) start at 1;
		-- unverified emails remain at 0.
		UPDATE "leads"
		SET "download_count" = 1
		WHERE "email_verified_at" IS NOT NULL
		  AND "download_count" = 0;

		CREATE INDEX IF NOT EXISTS idx_pdf_tokens_token ON pdf_access_tokens(token);

		-- Drop legacy verification index if present.
	IF to_regclass('public.idx_leads_email_verified') IS NOT NULL THEN
		DROP INDEX "idx_leads_email_verified";
	END IF;

		-- Drop legacy verification column.
		ALTER TABLE "leads" DROP COLUMN "email_verified_at";
	END IF;
END;
$$;

